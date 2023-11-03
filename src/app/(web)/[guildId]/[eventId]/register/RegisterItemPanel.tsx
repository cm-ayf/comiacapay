import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useCallback } from "react";
import type { Action, RecordState } from "./reducer";
import ItemPanel from "@/components/ItemPanel";

export default function RegisterItemPanel({
  item,
  record,
  dispatch,
}: {
  item: { id: string; name: string; picture: string | null };
  record: RecordState | undefined;
  dispatch: React.Dispatch<Action>;
}) {
  const set = useCallback(
    <K extends keyof RecordState>(type: K) =>
      (value: Required<RecordState>[K]) =>
        dispatch({ type: "set", itemId: item.id, [type]: value }),
    [dispatch, item.id],
  );

  return (
    <ItemPanel item={item}>
      <FlagsCheck
        dedication={record?.dedication ?? false}
        internal={record?.internal ?? false}
        setDedication={set("dedication")}
        setInternal={set("internal")}
      />
      <Counter count={record?.count ?? 0} setCount={set("count")} />
    </ItemPanel>
  );
}

function FlagsCheck({
  dedication,
  internal,
  setDedication,
  setInternal,
}: {
  dedication: boolean;
  internal: boolean;
  setDedication: (dedication: boolean) => void;
  setInternal: (internal: boolean) => void;
}) {
  return (
    <Box sx={{ display: "flex", columnGap: 2 }}>
      <FormControlLabel
        sx={{ mx: 2 }}
        control={
          <Checkbox
            checked={dedication}
            onChange={(e) => setDedication(e.target.checked)}
          />
        }
        label="献本"
      />
      <FormControlLabel
        sx={{ mx: 2 }}
        control={
          <Checkbox
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
          />
        }
        label="部内"
      />
    </Box>
  );
}

type Value = 0 | 1 | "+";

function Counter({
  count,
  setCount,
}: {
  count: number;
  setCount: (count: number) => void;
}) {
  const value = count === 0 || count === 1 ? count : "+";

  return (
    <Box sx={{ height: 56, mx: 2, mb: 2, display: "flex", columnGap: 2 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v: Value | null) => {
          if (v !== null) setCount({ 0: 0, 1: 1, "+": 2 }[v]);
          else if (value === "+") setCount(count + 1);
        }}
        sx={{ height: "100%", display: "flex", flexDirection: "row" }}
      >
        <ToggleButton size="large" value={0}>
          0
        </ToggleButton>
        <ToggleButton size="large" value={1}>
          1
        </ToggleButton>
        <ToggleButton size="large" value={"+"}>
          +
        </ToggleButton>
      </ToggleButtonGroup>
      <TextField
        type="number"
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value))}
        sx={{ height: "100%", width: 56 }}
      />
    </Box>
  );
}
