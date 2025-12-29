import { useImperativeHandle, useState, type Ref } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router";
import type { action } from "../$guildId.$eventId";
import type { loader } from "./loader";
import { useAlert } from "~/components/Alert";
import {
  ConformDialog,
  ConformDialogActions,
} from "~/components/ConformDialog";
import EventDialogContent from "~/components/EventDialogContent";
import { getISODateString } from "~/lib/date";
import { UpdateEvent, type ClientEvent } from "~/lib/schema";

interface MutateEventDialogProps {
  ref: Ref<{ open: (event: ClientEvent) => void }>;
}

export default function MutateEventDialog({ ref }: MutateEventDialogProps) {
  const [event, setEvent] = useState<ClientEvent>();
  useImperativeHandle(ref, () => ({ open: setEvent }));
  const { guildId } = useParams();
  const { success } = useAlert();
  const navigate = useNavigate();
  const { hasReceipt } = useLoaderData<typeof loader>();

  if (!event) return null;

  return (
    <ConformDialog<typeof UpdateEvent, typeof action>
      open
      onClose={() => setEvent(undefined)}
      title="イベントを編集"
      schema={UpdateEvent}
      defaultValue={{ name: event.name, date: getISODateString(event.date) }}
      submitConfig={{
        method: "PATCH",
        action: `/${guildId}/${event.id}`,
      }}
      onSubmitComplete={(data) => {
        if (!data) return;
        if ("delete" in data) {
          success("イベントを削除しました");
          navigate(`/${guildId}`);
        } else {
          success("イベントを更新しました");
        }
      }}
    >
      <EventDialogContent />
      <ConformDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={{
          label: "削除",
          disabled: hasReceipt,
          disabledMessage: "購入履歴があるため削除できません",
        }}
      />
    </ConformDialog>
  );
}
