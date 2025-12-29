import { useImperativeHandle, useState } from "react";
import { useParams } from "react-router";
import { useAlert } from "~/components/Alert";
import {
  ConformDialog,
  ConformDialogActions,
} from "~/components/ConformDialog";
import SetDiscountDialogContent from "~/components/SetDiscountDialogContent";
import { CreateSetDiscount, type ClientDisplay } from "~/lib/schema";

interface CreateSetDiscountDialogProps {
  ref: React.Ref<{ open: () => void }>;
  displays: ClientDisplay[];
}

export default function CreateSetDiscountDialog({
  ref,
  displays,
}: CreateSetDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  const { guildId, eventId } = useParams();
  const { success } = useAlert();
  return (
    <ConformDialog
      open={open}
      onClose={() => setOpen(false)}
      title="セット割引を追加"
      schema={CreateSetDiscount}
      defaultValue={{ __typename: "SetDiscount", itemIds: [], amount: 0 }}
      onSubmitComplete={() => success("セット割引を追加しました")}
      submitConfig={{
        method: "POST",
        action: `/${guildId}/${eventId}/discounts`,
      }}
    >
      <SetDiscountDialogContent displays={displays} />
      <ConformDialogActions submitButton={{ label: "保存" }} />
    </ConformDialog>
  );
}
