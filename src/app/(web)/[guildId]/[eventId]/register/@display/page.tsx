"use client";

import { useSuspenseQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useParams } from "next/navigation";
import { use } from "react";
import type { Params } from "../../params";
import GetEventRegisterQuery from "../GetEventRegister.graphql";
import { Register } from "../Register";
import type { RecordState } from "../Register";
import ItemPanel from "@/components/ItemPanel";

export const dynamic = "force-static";

export default function RegisterDisplay() {
  const [state, dispatch] = use(Register);
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetEventRegisterQuery, {
    fetchPolicy: "cache-first",
    variables: params,
  });

  return (
    <Grid container spacing={2}>
      {data.event.displays.map((display) => (
        <Grid item xs={12} md={6} xl={4} key={display.item.id}>
          <RegisterItemPanel
            display={display}
            record={state[display.item.id]}
            set={(key) => (value) =>
              dispatch({ type: "set", itemId: display.item.id, [key]: value })
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}

function RegisterItemPanel({
  display,
  record,
  set,
}: {
  display: {
    item: { name: string; picture: string | null };
    price: number;
  };
  record: RecordState | undefined;
  set: <K extends keyof RecordState>(
    type: K,
  ) => (value: Required<RecordState>[K]) => void;
}) {
  return (
    <ItemPanel item={display.item}>
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
