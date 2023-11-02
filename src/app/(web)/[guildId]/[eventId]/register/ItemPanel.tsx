import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useCallback } from "react";
import type { Action, RecordState } from "./reducer";
import type { Item } from "@/types/item";

export default function ItemPanel({
  item,
  record,
  dispatch,
}: {
  item: Item;
  record: RecordState | undefined;
  dispatch: React.Dispatch<Action>;
}) {
  const setCount = useCallback(
    (count: number) =>
      dispatch({ type: "setCount", itemcode: item.code, count }),
    [dispatch, item.code],
  );

  const setDedication = useCallback(
    (dedication: boolean) =>
      dispatch({ type: "setDedication", itemcode: item.code, dedication }),
    [dispatch, item.code],
  );

  return (
    <Card key={item.code} sx={{ width: "100%", display: "flex" }}>
      <CardMedia
        component="img"
        image={item.picture}
        alt={item.name}
        sx={{ width: 150 }}
      />
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ fontSize: "1.5em" }}>{item.name}</CardContent>
        <Box sx={{ flex: 1 }} />
        <CardActions
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <DedicationCheck
            selected={record?.dedication ?? false}
            onChange={setDedication}
          />
          <Counter count={record?.count ?? 0} onChange={setCount} />
        </CardActions>
      </Box>
    </Card>
  );
}

function DedicationCheck({
  selected,
  onChange,
}: {
  selected: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <FormControlLabel
      sx={{ mx: 2 }}
      control={
        <Checkbox
          checked={selected}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label="献本"
    />
  );
}

type Value = 0 | 1 | "+";

function Counter({
  count,
  onChange,
}: {
  count: number;
  onChange: (count: number) => void;
}) {
  const value = count === 0 || count === 1 ? count : "+";

  return (
    <Box sx={{ height: 56, mx: 2, mb: 2, display: "flex", columnGap: 2 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v: Value | null) => {
          if (v !== null) onChange({ 0: 0, 1: 1, "+": 2 }[v]);
          else if (value === "+") onChange(count + 1);
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
        onChange={(e) => onChange(parseInt(e.target.value))}
        sx={{ height: "100%", width: 56 }}
      />
    </Box>
  );
}
