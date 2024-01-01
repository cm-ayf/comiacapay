import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { BaseDialog, type DialogProps } from "./BaseDialog";
import { getISODateString } from "./date";
import type { CreateEvent } from "@/generated/schema";

export default function EventDialog({
  mode,
  onSubmit,
  defaultValues,
  events,
  ...rest
}: DialogProps<CreateEvent> & {
  events?: { id: string; name: string }[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm<CreateEvent>({
    defaultValues: defaultValues ?? { date: getISODateString(new Date()) },
  });

  return (
    <BaseDialog
      {...rest}
      reset={reset}
      submitProps={{
        disabled: !isValid || (mode === "update" && !isDirty),
        onClick: handleSubmit(onSubmit),
      }}
    >
      <TextField
        {...register("name", { required: mode === "create" })}
        label="イベント名"
        variant="standard"
      />
      <TextField
        {...register("date", { required: mode === "create" })}
        label="日付"
        type="date"
        variant="standard"
      />
      {events && (
        <FormControl sx={{ mt: 2 }}>
          <InputLabel>お品書きをコピー</InputLabel>
          <Select label="お品書きをコピー" {...register("clone")}>
            {events.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </BaseDialog>
  );
}
