import { valibotResolver } from "@hookform/resolvers/valibot";
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
  return (
    <RemixFormDialog<UpdateEventInput>
      {...props}
      title="イベントを編集"
      resolver={resolver}
      defaultValues={{ name: event.name, date: getISODateString(event.date) }}
      submitConfig={{ method: "PATCH", navigate: false }}
    >
      <EventDialogContent />
      <RemixFormDialogActions
        submitButton={{ label: "保存" }}
        deleteButton={{
          label: "削除",
          submitConfig: { method: "DELETE", navigate: true },
        }}
      />
    </RemixFormDialog>
  );
}
