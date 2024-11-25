import { valibotResolver } from "@hookform/resolvers/valibot";
import EventDialogContent from "~/components/EventDialogContent";
import {
  RemixFormDialog,
  RemixFormDialogActions,
} from "~/components/RemixFormDialog";
import { getISODateString } from "~/lib/date";
import {
  CreateEvent,
  type ClientEvent,
  type CreateEventInput,
} from "~/lib/schema";

const resolver = valibotResolver(CreateEvent);

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  events: ClientEvent[];
}

export default function CreateEventDialog({
  events,
  ...props
}: CreateEventDialogProps) {
  return (
    <RemixFormDialog<CreateEventInput>
      {...props}
      title="イベントを追加"
      resolver={resolver}
      defaultValues={{ date: getISODateString(new Date()), clone: null }}
      submitConfig={{ method: "POST", navigate: false }}
    >
      <EventDialogContent events={events} />
      <RemixFormDialogActions submitButton={{ label: "保存" }} />
    </RemixFormDialog>
  );
}
