import { valibotResolver } from "@hookform/resolvers/valibot";
import { useImperativeHandle, useState } from "react";
import { useParams } from "react-router";
import { useAlert } from "~/components/Alert";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import SetDiscountDialogContent from "~/components/SetDiscountDialogContent";
import {
  CreateSetDiscount,
  type ClientDisplay,
  type CreateSetDiscountInput,
} from "~/lib/schema";

const resolver = valibotResolver(CreateSetDiscount);

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
    <RemixFormDialog<CreateSetDiscountInput>
      open={open}
      onClose={() => setOpen(false)}
      title="セット割引を追加"
      resolver={resolver}
      defaultValues={{ __typename: "SetDiscount", itemIds: [], amount: 0 }}
      onSubmitComplete={() => success("セット割引を追加しました")}
      submitConfig={{
        method: "POST",
        action: `/${guildId}/${eventId}/discounts`,
        encType: "application/json",
      }}
    >
      <SetDiscountDialogContent displays={displays} />
      <RemixFormDialogActions submitButton={{ label: "保存" }} />
    </RemixFormDialog>
  );
}
