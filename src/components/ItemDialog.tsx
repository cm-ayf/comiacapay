import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { BaseDialog, type DialogProps } from "./BaseDialog";
import type { CreateItem } from "@/generated/schema";

export default function EventDialog({
  mode,
  onSubmit,
  defaultValues,
  ...rest
}: DialogProps<CreateItem>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm<CreateItem>({
    defaultValues: defaultValues ?? {},
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
        label="商品名"
        variant="standard"
      />
      <TextField
        {...register("picture", { required: mode === "create" })}
        label="商品画像URL"
        type="url"
        variant="standard"
      />
      <TextField
        {...register("issuedAt")}
        label="発行日"
        type="date"
        variant="standard"
      />
    </BaseDialog>
  );
}
