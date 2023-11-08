"use client";

import { useSuspenseQuery } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useParams } from "next/navigation";
import { use, useCallback } from "react";
import { Suspense } from "react";
import { PushButton } from "../../PushButton";
import { useCreateReceipt } from "../../idb";
import type { Params } from "../../params";
import GetEventRegisterQuery from "../GetEventRegister.graphql";
import { Register, type State } from "../Register";
import { useAlert } from "@/app/(web)/Alert";
import ErrorComponent from "@/components/ErrorComponent";
import { generateSnowflake } from "@/shared/snowflake";

export const dynamic = "force-static";

export default function Bottom() {
  return (
    <Paper
      variant="outlined"
      square
      sx={{
        height: 80,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        px: 2,
      }}
    >
      <ErrorBoundary errorComponent={ErrorComponent}>
        <Suspense fallback={<LinearProgress />}>
          <PushButton size="large" />
          <Box sx={{ flex: 1 }} />
          <Total />
          <CommitButton />
        </Suspense>
      </ErrorBoundary>
    </Paper>
  );
}

function Total() {
  const [state] = use(Register);
  const calculator = useCalculator();
  const total = calculator(state);

  return (
    <Typography variant="caption" px={2} fontSize="3em">
      ¥{total}
    </Typography>
  );
}

function CommitButton() {
  const [state, dispatch] = use(Register);
  const params = useParams<Params>();
  const { error } = useAlert();
  const calculator = useCalculator();
  const [trigger, { loading }] = useCreateReceipt(params);

  async function onClickCreate() {
    try {
      await trigger({
        id: generateSnowflake().toString(),
        total: calculator(state),
        records: Object.entries(state).map(([itemId, record]) => ({
          itemId,
          ...record,
        })),
      });
      dispatch({ type: "reset" });
    } catch (e) {
      error("登録に失敗しました");
    }
  }

  return (
    <LoadingButton
      size="large"
      variant="contained"
      loading={loading}
      disabled={Object.keys(state).length === 0}
      onClick={onClickCreate}
    >
      登録
    </LoadingButton>
  );
}

function useCalculator() {
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetEventRegisterQuery, {
    fetchPolicy: "cache-first",
    variables: params,
  });
  return useCallback(
    (state: State) => {
      let total = 0;
      for (const [itemId, { count }] of Object.entries(state)) {
        const display = data.event.displays.find((d) => d.item.id === itemId)!;
        total += count * display.price;
      }
      for (const discount of data.event.discounts) {
        switch (discount.__typename) {
          case "SetDiscount": {
            const count = Math.min(
              ...discount.itemIds.map((itemId) => state[itemId]?.count ?? 0),
            );
            total -= count * discount.discount;
            break;
          }
        }
      }
      return total;
    },
    [data.event.discounts, data.event.displays],
  );
}
