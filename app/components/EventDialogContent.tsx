import { getInputProps, getSelectProps } from "@conform-to/react";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useId } from "react";
import { useFormFieldSet } from "~/components/ConformDialog";
import type { ClientEvent, CreateEvent, UpdateEvent } from "~/lib/schema";

export default function EventDialogContent({
  events,
}: {
  events?: Pick<ClientEvent, "id" | "name">[];
}) {
  const fields = useFormFieldSet<typeof CreateEvent | typeof UpdateEvent>();
  const selectLabelId = useId();

  return (
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
      }}
    >
      <TextField
        {...getInputProps(fields.name, { type: "text" })}
        key={fields.name.key}
        error={!!fields.name.errors}
        helperText={fields.name.errors?.[0]}
        label="イベント名"
        variant="standard"
        fullWidth
      />
      <TextField
        {...getInputProps(fields.date, { type: "date" })}
        key={fields.date.key}
        error={!!fields.date.errors}
        helperText={fields.date.errors?.[0]}
        label="日付"
        type="date"
        variant="standard"
        fullWidth
      />
      {events && (
        <FormControl sx={{ mt: 2 }}>
          <InputLabel id={selectLabelId}>お品書きをコピー</InputLabel>
          <Select
            labelId={selectLabelId}
            label="お品書きをコピー"
            {...getSelectProps(fields.clone)}
            key={fields.clone.key}
            defaultValue={fields.clone.initialValue ?? ""}
          >
            {events.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </DialogContent>
  );
}
