import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useId } from "react";
import { useRemixFormContext } from "remix-hook-form";
import type {
  ClientEvent,
  CreateEventInput,
  UpdateEventInput,
} from "~/lib/schema";

export default function EventDialogContent({
  events,
}: {
  events?: Pick<ClientEvent, "id" | "name">[];
}) {
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<CreateEventInput | UpdateEventInput>();
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
        {...register("name", { required: true })}
        {...(errors.name && {
          error: true,
          helperText: errors.name.message,
        })}
        label="イベント名"
        variant="standard"
        fullWidth
      />
      <TextField
        {...register("date", { required: true, valueAsDate: true })}
        {...(errors.date && {
          error: true,
          helperText: errors.date.message,
        })}
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
            {...register("clone", { setValueAs: (v) => v || null })}
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
