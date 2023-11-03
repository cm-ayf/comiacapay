import Error from "@mui/icons-material/Error";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import type { Action, State } from "./reducer";
import { useAlert } from "@/app/(web)/Alert";
import { SyncButton } from "@/components/SyncButton";
import { useDBState } from "@/hooks/DBState";
import { useIDBCreateReceipt } from "@/hooks/idb";

export default function Bottom({
  event,
  state,
  dispatch,
}: {
  event: Event;
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const dbState = useDBState();
  const { trigger: triggerCreate, isMutating: isCreating } =
    useIDBCreateReceipt(event.code);
  const { error } = useAlert();
  const calculator = useCalculator(event);
  const total = calculator(state);

  async function onClickCreate() {
    if (isNaN(total)) return;
    const records = Object.entries(state).map(([itemcode, record]) => ({
      itemcode,
      count: record.count,
      dedication: record.dedication ?? false,
    }));
    try {
      await triggerCreate({ total, records });
      dispatch({ type: "reset" });
    } catch (e) {
      error("登録に失敗しました");
    }
  }

  return (
    <Paper
      variant="outlined"
      square
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        px: 2,
      }}
    >
      <SyncButton eventcode={event.code} size="large" variant="outlined" />
      <Box sx={{ flex: 1 }} />
      <Tooltip title={<PriceTable total={total} />} placement="top-start">
        <Typography variant="caption" px={2} fontSize="3em">
          {isNaN(total) ? "エラー" : `¥${total}`}
        </Typography>
      </Tooltip>
      <LoadingButton
        size="large"
        variant="contained"
        loading={dbState.type === "opening" || isCreating}
        startIcon={dbState.type === "error" && <Error />}
        disabled={
          dbState.type !== "available" ||
          Object.keys(state).length === 0 ||
          isNaN(total)
        }
        onClick={onClickCreate}
      >
        登録
      </LoadingButton>
    </Paper>
  );
}

function PriceTable({ total }: { total: number }) {
  const hints =
    total > 0
      ? [500, 1000, 5000, 10000]
          .filter((r) => r >= total)
          .map((r) => ({ receive: r, change: r - total }))
      : [];

  return (
    <Table size="small" sx={{ flex: 0 }}>
      <TableBody sx={{ rowGap: 0 }}>
        {hints.map(({ receive, change }) => (
          <TableRow key={receive}>
            <TableCell>¥{receive}</TableCell>
            <TableCell>→</TableCell>
            <TableCell>¥{change}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type Calculator = (state: State) => number;

function useCalculator({ calculator, items }: Event): Calculator {
  return useMemo(() => {
    const raw = new Function("state", calculator) as (state: State) => unknown;
    const defaults = Object.fromEntries(
      items.map((item) => [item.code, { count: 0 }]),
    );
    return (state) => Number(raw({ ...defaults, ...state }));
  }, [calculator, items]);
}
