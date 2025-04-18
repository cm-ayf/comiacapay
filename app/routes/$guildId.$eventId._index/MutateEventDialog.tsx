import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoaderData, useNavigate, useParams } from "react-router";
import type { action } from "./action";
import type { loader } from "./loader";
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
  const navigate = useNavigate();
  const { hasReceipt } = useLoaderData<typeof loader>();

  return (
    <RemixFormDialog<UpdateEventInput, typeof action>
      {...props}
      title="イベントを編集"
      resolver={resolver}
      defaultValues={{ name: event.name, date: getISODateString(event.date) }}
      submitConfig={{ method: "PATCH" }}
      onSubmitComplete={(data) =>
        data && "delete" in data && navigate(`/${guildId}`)
      }
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
