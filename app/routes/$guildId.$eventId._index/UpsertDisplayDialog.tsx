import { useImperativeHandle, useState } from "react";
import { useLoaderData, useParams } from "react-router";
import type { InferInput } from "valibot";
import type { action } from "../$guildId.$eventId.displays.$itemId";
import type { loader } from "./loader";
import { useAlert } from "~/components/Alert";
import {
  ConformDialog,
  ConformDialogActions,
} from "~/components/ConformDialog";
import DisplayDialogContent from "~/components/DisplayDialogContent";
import {
  UpsertDisplay,
  type ClientDisplay,
  type ClientItem,
} from "~/lib/schema";

export type UpsertDisplayDialogInput =
  | (ClientDisplay & { create?: never })
  | { item: ClientItem; create: true };

export interface UpsertDisplayDialogProps {
  ref: React.Ref<{ open: (display: UpsertDisplayDialogInput) => void }>;
}

export default function UpsertDisplayDialog({ ref }: UpsertDisplayDialogProps) {
  const [display, setDisplay] = useState<UpsertDisplayDialogInput>();
  useImperativeHandle(ref, () => ({ open: setDisplay }));
  const { guildId, eventId } = useParams();
  const { hasReceipt } = useLoaderData<typeof loader>();
  const { success } = useAlert();
  if (!display) return null;

  const defaultValue = display.create
    ? undefined
    : ({
        price: display.price,
        internalPrice: display.internalPrice,
        dedication: display.dedication,
      } satisfies InferInput<typeof UpsertDisplay>);

  return (
    <ConformDialog<typeof UpsertDisplay, typeof action>
      open={Boolean(display)}
      onClose={() => setDisplay(undefined)}
      title={`${display.item.name}のお品書きを${display.create ? "追加" : "編集"}`}
      schema={UpsertDisplay}
      defaultValue={defaultValue}
      onSubmitComplete={(data) => {
        if (!data) return;
        if ("delete" in data) {
          success("お品書きを削除しました");
        } else {
          success("お品書きを更新しました");
        }
      }}
      submitConfig={{
        method: "PUT",
        action: `/${guildId}/${eventId}/displays/${display.item.id}`,
      }}
    >
      <DisplayDialogContent />
      <ConformDialogActions
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
    </ConformDialog>
  );
}
