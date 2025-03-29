import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material-pigment-css/Box";
import { useEvent } from "../$guildId.$eventId";
import DisplayPanel from "~/components/DisplayPanel";
import { useRecordSnapshot } from "~/lib/register";
import type { ClientDisplay } from "~/lib/schema";

export function RegisterDisplayPanel({ display }: { display: ClientDisplay }) {
  return (
    <DisplayPanel display={display}>
      <FlagsCheck display={display} />
      <Counter itemId={display.itemId} />
    </DisplayPanel>
  );
}

function FlagsCheck({ display }: { display: ClientDisplay }) {
  const event = useEvent();
  const [record, setRecord] = useRecordSnapshot(event, display.itemId);
  return (
    <Box sx={{ paddingInline: 2, display: "flex", gap: 1 }}>
      {display.dedication && (
        <FormControlLabel
          control={
            <Checkbox
              checked={record.dedication}
              onChange={(e) => {
                setRecord(({ count }) => ({
                  count: Math.max(count, 1),
                  dedication: e.target.checked,
                  internal: false,
                }));
              }}
            />
          }
          label="献本"
        />
      )}
      {display.internalPrice && (
        <FormControlLabel
          control={
            <Checkbox
              checked={record.internal}
              onChange={(e) => {
                setRecord(({ count }) => ({
                  count: Math.max(count, 1),
                  dedication: false,
                  internal: e.target.checked,
                }));
              }}
            />
          }
          label="部内"
        />
      )}
    </Box>
  );
}

type Value = 0 | 1 | "+";

function Counter({ itemId }: { itemId: string }) {
  const event = useEvent();
  const [record, setRecord] = useRecordSnapshot(event, itemId);
  const value = record.count === 0 || record.count === 1 ? record.count : "+";

  return (
    <Box sx={{ height: 56, display: "flex", flexDirection: "row", gap: 1 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v: Value | null) => {
          v ??= value;
          if (typeof v === "number") setRecord({ count: v });
          else setRecord(({ count }) => ({ count: Math.max(count + 1, 2) }));
        }}
        sx={{ height: "100%", display: "flex", flexDirection: "row" }}
      >
        <ToggleButton size="large" value={0}>
          0
        </ToggleButton>
        <ToggleButton size="large" value={1}>
          1
        </ToggleButton>
        <ToggleButton size="large" value="+">
          +
        </ToggleButton>
      </ToggleButtonGroup>
      <TextField
        type="number"
        value={record.count}
        onChange={(e) => setRecord({ count: parseInt(e.target.value) })}
        sx={{ height: "100%" }}
      />
    </Box>
  );
}
