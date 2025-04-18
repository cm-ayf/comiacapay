import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoaderData, useParams } from "react-router";
import type { loader } from "./loader";
import DisplayDialogContent from "~/components/DisplayDialogContent";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import {
  UpsertDisplay,
  type ClientDisplay,
  type ClientItem,
  type UpsertDisplayInput,
} from "~/lib/schema";

const resolver = valibotResolver(UpsertDisplay);

export type UpsertDisplayDialogInput =
  | (ClientDisplay & { create?: never })
  | { item: ClientItem; create: true };

export interface UpsertDisplayDialogProps {
  display: UpsertDisplayDialogInput | undefined;
  onClose: () => void;
}

export default function UpsertDisplayDialog({
  display,
  onClose,
}: UpsertDisplayDialogProps) {
  const { guildId, eventId } = useParams();
  const { hasReceipt } = useLoaderData<typeof loader>();
  if (!display) return null;

  return (
    <RemixFormDialog<UpsertDisplayInput>
      open
      onClose={onClose}
      title={`${display.item.name}のお品書きを${display.create ? "追加" : "編集"}`}
      resolver={resolver}
      defaultValues={
        display.create
          ? {}
          : {
              price: display.price,
              internalPrice: display.internalPrice,
              dedication: display.dedication,
            }
      }
      submitConfig={{
        method: "PUT",
        action: `/${guildId}/${eventId}/displays/${display.item.id}`,
      }}
    >
      <DisplayDialogContent />
      <RemixFormDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={
          display.create
            ? undefined
            : {
                label: "削除",
                disabled: hasReceipt,
                disabledMessage: "購入履歴があるため削除できません",
              }
        }
      />
    </RemixFormDialog>
  );
}
