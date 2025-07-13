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
    watch,
    setValue,
    formState: { errors },
  } = useRemixFormContext<CreateSetDiscountInput>();

  const currentItemIds = watch("itemIds") || [];

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    const newItemIds = checked
      ? [...currentItemIds, itemId]
      : currentItemIds.filter((id) => id !== itemId);
    setValue("itemIds", newItemIds);
  };

  return (
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
      }}
    >
      <FormControl sx={{ mt: 2 }} error={!!errors.itemIds}>
        <FormLabel component="legend">商品の組み合わせ</FormLabel>
        <FormGroup>
          {displays.map(({ item }) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={currentItemIds.includes(item.id)}
                  onChange={(e) =>
                    handleCheckboxChange(item.id, e.target.checked)
                  }
                />
              }
              label={item.name}
            />
          ))}
        </FormGroup>
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          {...register("itemIds", { required: "商品を選択してください" })}
          value={currentItemIds.join(",")}
        />
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
