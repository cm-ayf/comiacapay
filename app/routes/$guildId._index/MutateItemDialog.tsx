import { useImperativeHandle, useMemo, useState, type Ref } from "react";
import { useLoaderData, useParams } from "react-router";
import type { action } from "../$guildId.items.$itemId";
import type { loader } from "./loader";
import { useAlert } from "~/components/Alert";
import ItemDialogContent from "~/components/ItemDialogContent";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import { getISODateString } from "~/lib/date";
import {
  UpdateItem,
  type ClientEvent,
  type ClientItem,
  type UpdateItemInput,
} from "~/lib/schema";

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
    <RemixFormDialog<UpdateItemInput, typeof action>
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
      onSubmitComplete={(data) => {
        if (!data) return;
        if ("delete" in data) {
          success("商品を削除しました");
        } else {
          success("商品を更新しました");
        }
      }}
    >
      <ItemDialogContent />
      <RemixFormDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={{
          label: "削除",
          disabled: usedItemIds.has(item.id),
          disabledMessage: "お品書きがあるため削除できません",
        }}
      />
    </RemixFormDialog>
  );
}

function* flatItemIds(events: ClientEvent[]) {
  for (const event of events) {
    for (const { itemId } of event.displays) {
      yield itemId;
    }
  }
}
