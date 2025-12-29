import { useImperativeHandle, useState, type Ref } from "react";
import { useParams } from "react-router";
import { useAlert } from "~/components/Alert";
import {
  ConformDialog,
  ConformDialogActions,
} from "~/components/ConformDialog";
import ItemDialogContent from "~/components/ItemDialogContent";
import { getISODateString } from "~/lib/date";
import { CreateItem } from "~/lib/schema";

interface CreateItemDialogProps {
  ref: Ref<{ open: () => void }>;
}

export default function CreateItemDialog({ ref }: CreateItemDialogProps) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  const { guildId } = useParams();
  const { success } = useAlert();

  return (
    <ConformDialog
      open={open}
      onClose={() => setOpen(false)}
      title="商品を追加"
      schema={CreateItem}
      defaultValue={{
        name: "",
        picture: null,
        issuedAt: getISODateString(new Date()),
      }}
      submitConfig={{ method: "POST", action: `/${guildId}/items` }}
      onSubmitComplete={(data) => {
        if (!data) return;
        success("商品を追加しました");
      }}
    >
      <ItemDialogContent />
      <ConformDialogActions submitButton={{ label: "保存" }} />
    </ConformDialog>
  );
}
