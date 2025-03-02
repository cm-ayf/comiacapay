import Checkbox from "@mui/material/Checkbox";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useRemixFormContext } from "remix-hook-form";
import type { UpsertDisplayInput } from "~/lib/schema";

export default function DisplayDialogContent() {
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<UpsertDisplayInput>();

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
        {...register("price", { required: true, valueAsNumber: true })}
        {...(errors.price && {
          error: true,
          helperText: errors.price.message,
        })}
        required
        label="価格"
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">¥</InputAdornment>,
          },
        }}
        variant="standard"
        fullWidth
      />
      <TextField
        {...register("internalPrice", {
          setValueAs: (v) => (v ? Number(v) : null),
        })}
        {...(errors.internalPrice && {
          error: true,
          helperText: errors.internalPrice.message,
        })}
        label="部内頒布価格"
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">¥</InputAdornment>,
          },
        }}
        variant="standard"
        fullWidth
      />
      <FormControlLabel
        control={<Checkbox {...register("dedication")} />}
        label="献本あり"
      />
    </DialogContent>
  );
}
