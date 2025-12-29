import { getInputProps } from "@conform-to/react";
import Checkbox from "@mui/material/Checkbox";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormFieldSet } from "~/components/ConformDialog";
import type { UpsertDisplay } from "~/lib/schema";

export default function DisplayDialogContent() {
  const fields = useFormFieldSet<typeof UpsertDisplay>();

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
        {...getInputProps(fields.price, { type: "number" })}
        error={!!fields.price.errors}
        helperText={fields.price.errors?.[0]}
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
        {...getInputProps(fields.internalPrice, { type: "number" })}
        error={!!fields.internalPrice.errors}
        helperText={fields.internalPrice.errors?.[0]}
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
        control={
          <Checkbox
            {...getInputProps(fields.dedication, { type: "checkbox" })}
          />
        }
        label="献本あり"
      />
    </DialogContent>
  );
}
