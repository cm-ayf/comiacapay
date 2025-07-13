import Checkbox from "@mui/material/Checkbox";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import { useRemixFormContext } from "remix-hook-form";
import type { CreateSetDiscountInput, ClientDisplay } from "~/lib/schema";

export default function SetDiscountDialogContent({
  displays,
}: {
  displays: ClientDisplay[];
}) {
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<CreateSetDiscountInput>();

  return (
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
      }}
    >
      <FormControl
        sx={{ mt: 2 }}
        {...(errors.itemIds && {
          error: true,
          helperText: errors.itemIds.message,
        })}
      >
        <FormLabel component="legend">商品の組み合わせ</FormLabel>
        <FormGroup>
          {displays.map(({ item }) => (
            <FormControlLabel
              key={item.id}
              control={<Checkbox value={item.id} {...register("itemIds")} />}
              label={item.name}
            />
          ))}
        </FormGroup>
      </FormControl>
      <TextField
        {...register("amount", { required: true, valueAsNumber: true })}
        {...(errors.amount && {
          error: true,
          helperText: errors.amount.message,
        })}
        label="割引額"
        type="number"
        variant="standard"
        fullWidth
      />
    </DialogContent>
  );
}
