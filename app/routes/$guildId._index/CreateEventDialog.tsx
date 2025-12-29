import { useImperativeHandle, useState, type Ref } from "react";
import { useNavigate, useParams } from "react-router";
import type { action } from "./action";
import { useAlert } from "~/components/Alert";
import {
  ConformDialog,
  ConformDialogActions,
} from "~/components/ConformDialog";
import EventDialogContent from "~/components/EventDialogContent";
import { getISODateString } from "~/lib/date";
import { CreateEvent, type ClientEvent } from "~/lib/schema";

interface CreateEventDialogProps {
  ref: Ref<{ open: () => void }>;
  events: ClientEvent[];
}

export default function CreateEventDialog({
  events,
  ...props
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(props.ref, () => ({
    open: () => setOpen(true),
  }));
  const { guildId } = useParams();
  const navigate = useNavigate();
  const { success } = useAlert();

  return (
    <ConformDialog<typeof CreateEvent, typeof action>
      open={open}
      onClose={() => setOpen(false)}
      title="イベントを追加"
      schema={CreateEvent}
      defaultValue={{ name: "", date: getISODateString(new Date()), clone: "" }}
      submitConfig={{ method: "POST" }}
      onSubmitComplete={(data) => {
        success("イベントを追加しました");
        navigate(`/${guildId}/${data.id}`);
      }}
    >
      <EventDialogContent events={events} />
      <ConformDialogActions submitButton={{ label: "保存" }} />
    </ConformDialog>
  );
}
