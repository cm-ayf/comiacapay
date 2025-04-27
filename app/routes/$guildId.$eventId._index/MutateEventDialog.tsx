import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoaderData, useNavigate, useParams } from "react-router";
import type { action } from "../$guildId.$eventId";
import type { loader } from "./loader";
import { useAlert } from "~/components/Alert";
import EventDialogContent from "~/components/EventDialogContent";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import { getISODateString } from "~/lib/date";
import {
  UpdateEvent,
  type ClientEvent,
  type UpdateEventInput,
} from "~/lib/schema";

const resolver = valibotResolver(UpdateEvent);

interface MutateEventDialogProps {
  event: ClientEvent;
  open: boolean;
  onClose: () => void;
}

export default function MutateEventDialog({
  event,
  ...props
}: MutateEventDialogProps) {
  const { guildId } = useParams();
  const { success } = useAlert();
  const navigate = useNavigate();
  const { hasReceipt } = useLoaderData<typeof loader>();

  return (
    <RemixFormDialog<UpdateEventInput, typeof action>
      {...props}
      title="イベントを編集"
      resolver={resolver}
      defaultValues={{ name: event.name, date: getISODateString(event.date) }}
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
      <RemixFormDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={{
          label: "削除",
          disabled: hasReceipt,
          disabledMessage: "購入履歴があるため削除できません",
        }}
      />
    </RemixFormDialog>
  );
}
