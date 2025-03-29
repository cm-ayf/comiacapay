import { valibotResolver } from "@hookform/resolvers/valibot";
import { useParams } from "@remix-run/react";
import ItemDialogContent from "~/components/ItemDialogContent";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import { getISODateString } from "~/lib/date";
import {
  UpdateItem,
  type ClientItem,
  type UpdateItemInput,
} from "~/lib/schema";

const resolver = valibotResolver(UpdateItem);

export interface MutateItemDialogProps {
  item: ClientItem | undefined;
  onClose: () => void;
}

export default function MutateItemDialog({
  item,
  onClose,
}: MutateItemDialogProps) {
  const { guildId } = useParams();
  if (!item) return null;

  return (
    <RemixFormDialog<UpdateItemInput>
      open
      onClose={onClose}
      title="商品を追加"
      resolver={resolver}
      defaultValues={{
        name: item.name,
        picture: item.picture,
        issuedAt: getISODateString(item.issuedAt),
      }}
      submitConfig={{
        method: "PATCH",
        action: `/${guildId}/items/${item.id}`,
        navigate: false,
      }}
    >
      <ItemDialogContent />
      <RemixFormDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={{ label: "削除" }}
      />
    </RemixFormDialog>
  );
}
