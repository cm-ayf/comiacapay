"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import { useAlert } from "@/hooks/Alert";
import { useScopes } from "@/hooks/UserState";
import {
  RouteError,
  useDeleteEvent,
  useEvent,
  useUpdateEvent,
} from "@/hooks/swr";
import { Event, UpdateEvent } from "@/types/event";

export default function About({ eventcode }: { eventcode: string }) {
  const { data: event } = useEvent({ eventcode });
  const router = useRouter();
  const scopes = useScopes();

  const [open, setOpen] = useState(false);

  if (!event) return <CircularProgress />;
  return (
    <>
      <Box sx={{ my: 2, display: "flex", flexDirection: "row", columnGap: 2 }}>
        <EventCard
          event={event}
          {...(scopes?.write ? { onClick: () => setOpen(true) } : {})}
        />
        <Button
          variant="contained"
          onClick={() => router.push(`/${event.code}/register`)}
          disabled={!scopes?.register}
        >
          レジを起動
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push(`/${event.code}/receipts`)}
        >
          購入履歴
        </Button>
      </Box>
      {scopes?.write && (
        <UpdateEventDialog
          event={event}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function UpdateEventDialog({
  event,
  open,
  onClose,
}: {
  event: Event;
  open: boolean;
  onClose: () => void;
}) {
  const { trigger: triggerUpdate, isMutating: isUpdating } = useUpdateEvent({
    eventcode: event.code,
  });
  const { trigger: triggerDelete, isMutating: isDeleting } = useDeleteEvent({
    eventcode: event.code,
  });
  const router = useRouter();
  const { error, success } = useAlert();

  async function onClickUpdate(body: UpdateEvent) {
    try {
      await triggerUpdate(body);
      success("イベントを更新しました");
      onClose();
      if (body.code) router.replace(`/${body.code}`);
    } catch (e) {
      if ((e as RouteError)?.code === "CONFLICT")
        error("イベントコードが重複しています");
      else error("イベントの更新に失敗しました");
      throw e;
    }
  }

  async function onClickDelete() {
    try {
      await triggerDelete(null, { revalidate: false });
      router.push("/");
    } catch (e) {
      if ((e as RouteError)?.code === "CONFLICT")
        error("このイベントにはすでに購入履歴があります");
      error("イベントの削除に失敗しました");
      throw e;
    }
  }

  return (
    <EventDialog
      schema={UpdateEvent}
      title="イベントを更新"
      event={event}
      open={open}
      onClose={onClose}
      isMutating={isUpdating || isDeleting}
      buttons={[
        {
          label: "更新",
          needsValidation: true,
          needsUpdate: true,
          onClick: onClickUpdate,
        },
        { label: "削除", color: "error", onClick: onClickDelete },
      ]}
    />
  );
}
