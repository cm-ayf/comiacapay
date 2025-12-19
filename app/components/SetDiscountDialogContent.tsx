import { getInputProps } from "@conform-to/react";
import Checkbox from "@mui/material/Checkbox";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import { useFormFields } from "~/components/RemixFormDialog";
import type { ClientDisplay } from "~/lib/schema";

export default function SetDiscountDialogContent({
  displays,
}: {
  displays: ClientDisplay[];
}) {
  const fields = useFormFields();
  const itemIdsField = fields["itemIds"];

  return (
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
      }}
    >
      {itemIdsField && (
        <FormControl
          sx={{ mt: 2 }}
          error={!!itemIdsField.errors}
        >
          <FormLabel component="legend">商品の組み合わせ</FormLabel>
          <FormGroup>
            {displays.map(({ item }) => {
              const initialValueArray = itemIdsField.initialValue as string[] | undefined;
              const isChecked = initialValueArray?.includes(item.id) ?? false;
              return (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      name={itemIdsField.name}
                      value={item.id}
                      defaultChecked={isChecked}
                    />
                  }
                  label={item.name}
                />
              );
            })}
          </FormGroup>
          {itemIdsField.errors && (
            <div style={{ color: "red", fontSize: "0.75rem" }}>
              {itemIdsField.errors[0]}
            </div>
          )}
        </FormControl>
      )}
      <TextField
        {...getInputProps(fields["amount"]!, { type: "number" })}
        key={fields["amount"]?.key}
        error={!!fields["amount"]?.errors}
        helperText={fields["amount"]?.errors?.[0]}
        label="割引額"
        type="number"
        variant="standard"
        fullWidth
      />
    </DialogContent>
  );
}
