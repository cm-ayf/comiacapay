import { useImperativeHandle, useMemo, useState, type Ref } from "react";
import { useLoaderData, useParams } from "react-router";
import { useAlert } from "~/components/Alert";
import {
  ConformDialog,
  ConformDialogActions,
} from "~/components/ConformDialog";
import ItemDialogContent from "~/components/ItemDialogContent";
import { getISODateString } from "~/lib/date";
import { UpdateItem, type ClientEvent, type ClientItem } from "~/lib/schema";
import type { loader } from "./loader";

export interface MutateItemDialogProps {
  ref: Ref<{ open: (item: ClientItem) => void }>;
}

export default function MutateItemDialog({ ref }: MutateItemDialogProps) {
  const [item, setItem] = useState<ClientItem>();
  useImperativeHandle(ref, () => ({ open: setItem }));
  const { guildId } = useParams();
  const events = useLoaderData<typeof loader>();
  const usedItemIds = useMemo(() => new Set(flatItemIds(events)), [events]);
  const { success } = useAlert();

  if (!item) return null;

  return (
    <ConformDialog
      open
      onClose={() => setItem(undefined)}
      title="商品を編集"
      schema={UpdateItem}
      defaultValue={{
        name: item.name,
        picture: item.picture,
        issuedAt: getISODateString(item.issuedAt),
      }}
      submitConfig={{ method: "PATCH", action: `/${guildId}/items/${item.id}` }}
      onSubmitComplete={() => {
        success("商品を更新しました");
      }}
      onDeleteComplete={() => {
        success("商品を削除しました");
      }}
    >
      <ItemDialogContent />
      <ConformDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={{
          label: "削除",
          disabled: usedItemIds.has(item.id),
          disabledMessage: "お品書きがあるため削除できません",
        }}
      />
    </ConformDialog>
  );
}

function* flatItemIds(events: ClientEvent[]) {
  for (const event of events) {
    for (const { itemId } of event.displays) {
      yield itemId;
    }
  }
}
