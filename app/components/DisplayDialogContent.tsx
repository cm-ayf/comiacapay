import { getInputProps } from "@conform-to/react";
import Checkbox from "@mui/material/Checkbox";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormFields } from "~/components/RemixFormDialog";

export default function DisplayDialogContent() {
  const fields = useFormFields();

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
        {...getInputProps(fields["price"]!, { type: "number" })}
        key={fields["price"]?.key}
        error={!!fields["price"]?.errors}
        helperText={fields["price"]?.errors?.[0]}
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
        {...getInputProps(fields["internalPrice"]!, { type: "number" })}
        key={fields["internalPrice"]?.key}
        error={!!fields["internalPrice"]?.errors}
        helperText={fields["internalPrice"]?.errors?.[0]}
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
            {...getInputProps(fields["dedication"]!, { type: "checkbox" })}
            key={fields["dedication"]?.key}
            defaultChecked={fields["dedication"]?.initialValue === "on"}
          />
        }
        label="献本あり"
      />
    </DialogContent>
  );
}
