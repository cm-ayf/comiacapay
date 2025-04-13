import { valibotResolver } from "@hookform/resolvers/valibot";
import { useParams } from "@remix-run/react";
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
  open: boolean;
  onClose: () => void;
  displays: ClientDisplay[];
}

export default function CreateSetDiscountDialog({
  displays,
  ...props
}: CreateSetDiscountDialogProps) {
  const { guildId, eventId } = useParams();
  return (
    <RemixFormDialog<CreateSetDiscountInput>
      {...props}
      title="セット割引を追加"
      resolver={resolver}
      defaultValues={{ __typename: "SetDiscount", itemIds: [], amount: 0 }}
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
