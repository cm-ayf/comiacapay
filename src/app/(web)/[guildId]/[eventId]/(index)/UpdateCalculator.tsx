"use client";

import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { compressToEncodedURIComponent } from "lz-string";
import { useEffect, useMemo, useState } from "react";
import { useAlert } from "@/hooks/Alert";
import { useScopes } from "@/hooks/UserState";
import { useEvent, useUpdateEvent } from "@/hooks/swr";
import { Calculator } from "@/types/common";
import { Event as EventSchema } from "@/types/event";

export default function UpdateCalculator({ eventcode }: { eventcode: string }) {
  const { data: event, isLoading } = useEvent({ eventcode });
  const { trigger, isMutating } = useUpdateEvent({ eventcode });
  const { error, success } = useAlert();
  const scopes = useScopes();
  const defaultCalculator = event?.calculator ?? "";
  const [calculator, setCalculator] = useState(defaultCalculator);

  useEffect(() => {
    if (isLoading || !event) return;
    setCalculator(event.calculator);
    // for first state rendering; should only be called once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const hash = useMemo(
    () => event && compressToEncodedURIComponent(playground(event)),
    [event],
  );

  async function onClick() {
    try {
      await trigger({ calculator });
      success("計算機を更新しました");
    } catch (e) {
      error("計算機の更新に失敗しました");
      throw e;
    }
  }

  return (
    <>
      <Box sx={{ my: 2, display: "flex", flexDirection: "row", columnGap: 2 }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          計算機
        </Typography>
        <Button
          variant="outlined"
          sx={{ textTransform: "none" }}
          href={`https://www.typescriptlang.org/play?#code/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          TS Playground
        </Button>
        <LoadingButton
          variant="contained"
          loading={isMutating}
          disabled={
            !scopes?.write ||
            isLoading ||
            calculator === event?.calculator ||
            !calculatorTypeCheck.Check(calculator)
          }
          onClick={onClick}
        >
          更新
        </LoadingButton>
      </Box>
      <Box
        sx={{ mx: 2, width: "100%", display: "flex", flexDirection: "column" }}
      >
        {"function calculate(state) {"}
        <TextField
          variant="outlined"
          sx={{ px: 2, width: "100%" }}
          value={calculator}
          error={
            calculator !== event?.calculator &&
            !calculatorTypeCheck.Check(calculator)
          }
          multiline
          onChange={(e) => setCalculator(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            setCalculator(dedent(text));
          }}
          disabled={!scopes?.write}
        />
        {"}"}
      </Box>
    </>
  );
}

function playground({ calculator, items }: EventSchema) {
  return `\
type Itemcode = ${items.map((item) => `"${item.code}"`).join(" | ") || "never"};

/** 購入履歴データのうち1つの商品のデータ */
interface RecordState {
  /** その商品の購入個数 */
  count: number;
  /** その商品が「献本」であるか */
  dedication?: boolean;
}

/** 1つの購入履歴データ */
type State = Record<Itemcode, RecordState>;

function calculate(state: State): number {
${calculator
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}
}
`;
}

function dedent(text: string) {
  const lines = text.split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^\s*/)?.[0].length ?? Infinity);
  const indent = Math.min(...indents);
  return lines.map((line) => line.slice(indent)).join("\n");
}

const calculatorTypeCheck = TypeCompiler.Compile(Calculator);
