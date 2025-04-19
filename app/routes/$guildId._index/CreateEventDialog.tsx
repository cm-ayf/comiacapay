import { valibotResolver } from "@hookform/resolvers/valibot";
import { useNavigate, useParams } from "react-router";
import type { action } from "./action";
import { useAlert } from "~/components/Alert";
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
  const { guildId } = useParams();
  const navigate = useNavigate();
  const { success } = useAlert();

  return (
    <RemixFormDialog<CreateEventInput, typeof action>
      {...props}
      title="イベントを追加"
      resolver={resolver}
      defaultValues={{ date: getISODateString(new Date()), clone: "" }}
      submitConfig={{ method: "POST" }}
      onSubmitComplete={(data) => {
        if (!data) return;
        success("イベントを追加しました");
        navigate(`/${guildId}/${data.id}`);
      }}
    >
      <EventDialogContent events={events} />
      <RemixFormDialogActions submitButton={{ label: "保存" }} />
    </RemixFormDialog>
  );
}
