import { valibotResolver } from "@hookform/resolvers/valibot";
import { useImperativeHandle, useState, type Ref } from "react";
import { useParams } from "react-router";
import { useAlert } from "~/components/Alert";
import ItemDialogContent from "~/components/ItemDialogContent";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import { getISODateString } from "~/lib/date";
import { CreateItem, type CreateItemInput } from "~/lib/schema";

const resolver = valibotResolver(CreateItem);

interface CreateItemDialogProps {
  ref: Ref<{ open: () => void }>;
}

export default function CreateItemDialog(props: CreateItemDialogProps) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(props.ref, () => ({
    open: () => setOpen(true),
  }));
  const { guildId } = useParams();
  const { success } = useAlert();

  return (
    <RemixFormDialog<CreateItemInput>
      open={open}
      onClose={() => setOpen(false)}
      title="商品を追加"
      resolver={resolver}
      defaultValues={{ picture: null, issuedAt: getISODateString(new Date()) }}
      submitConfig={{ method: "POST", action: `/${guildId}/items` }}
      onSubmitComplete={(data) => {
        if (!data) return;
        success("商品を追加しました");
      }}
    >
      <ItemDialogContent />
      <RemixFormDialogActions submitButton={{ label: "保存" }} />
    </RemixFormDialog>
  );
}
