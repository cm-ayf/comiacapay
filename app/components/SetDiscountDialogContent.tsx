import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useId, useState } from "react";
import { useRemixFormContext } from "remix-hook-form";
import type { CreateSetDiscountInput, ClientDisplay } from "~/lib/schema";

function toSplitArray(v: string | string[]): string[] {
  return Array.isArray(v) ? v : v.split(",");
}

export default function SetDiscountDialogContent({
  displays,
}: {
  displays: ClientDisplay[];
}) {
  const {
    register,
    getValues,
    formState: { errors },
  } = useRemixFormContext<CreateSetDiscountInput>();

  // for rendering <Select>
  const [itemIds, setItemIds] = useState<string[]>(() => getValues("itemIds"));

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
      <FormControl sx={{ mt: 2 }}>
        <InputLabel id={selectLabelId}>商品の組み合わせ</InputLabel>
        <Select
          {...register("itemIds", { required: true, setValueAs: toSplitArray })}
          {...(errors.itemIds && {
            error: true,
            helperText: errors.itemIds.message,
          })}
          value={itemIds}
          onChange={(e) => setItemIds(toSplitArray(e.target.value))}
          labelId={selectLabelId}
          label="商品の組み合わせ"
          multiple
          fullWidth
        >
          {displays.map(({ item }) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
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
