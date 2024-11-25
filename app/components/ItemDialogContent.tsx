import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import { useRemixFormContext } from "remix-hook-form";
import type { CreateItemInput, UpdateItemInput } from "~/lib/schema";

export default function ItemDialogContent() {
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<CreateItemInput | UpdateItemInput>();

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
        {...register("name")}
        {...(errors.name && {
          error: true,
          helperText: errors.name.message,
        })}
        label="商品名"
        variant="standard"
        fullWidth
      />
      <TextField
        {...register("picture")}
        {...(errors.picture && {
          error: true,
          helperText: errors.picture.message,
        })}
        label="商品画像URL"
        type="url"
        variant="standard"
        fullWidth
      />
      <TextField
        {...register("issuedAt")}
        {...(errors.issuedAt && {
          error: true,
          helperText: errors.issuedAt.message,
        })}
        label="発行日"
        type="date"
        variant="standard"
        fullWidth
      />
    </DialogContent>
  );
}
