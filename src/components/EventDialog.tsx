import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { getISODateString } from "../shared/utils";
import { BaseDialog, type DialogProps } from "./BaseDialog";
import type { CreateEvent } from "@/generated/schema";

export default function EventDialog({
  mode,
  onSubmit,
  defaultValues,
  ...rest
}: DialogProps<CreateEvent>) {
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
        disabled:
          (!!mode && !isValid) || (!!mode && mode === "update" && !isDirty),
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
    </BaseDialog>
  );
}
