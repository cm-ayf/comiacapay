import { getInputProps } from "@conform-to/react";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import { useFormFieldSet } from "~/components/ConformDialog";
import type { CreateItem, UpdateItem } from "~/lib/schema";

export default function ItemDialogContent() {
  const fields = useFormFieldSet<typeof CreateItem | typeof UpdateItem>();

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
        {...getInputProps(fields["name"]!, { type: "text" })}
        key={fields["name"]?.key}
        error={!!fields["name"]?.errors}
        helperText={fields["name"]?.errors?.[0]}
        label="商品名"
        variant="standard"
        fullWidth
      />
      <TextField
        {...getInputProps(fields["picture"]!, { type: "url" })}
        key={fields["picture"]?.key}
        error={!!fields["picture"]?.errors}
        helperText={fields["picture"]?.errors?.[0]}
        label="商品画像URL"
        type="url"
        variant="standard"
        fullWidth
      />
      <TextField
        {...getInputProps(fields["issuedAt"]!, { type: "date" })}
        key={fields["issuedAt"]?.key}
        error={!!fields["issuedAt"]?.errors}
        helperText={fields["issuedAt"]?.errors?.[0]}
        label="発行日"
        type="date"
        variant="standard"
        fullWidth
      />
    </DialogContent>
  );
}
