"use client";

import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import { useAlert } from "@/hooks/Alert";
import { useScopes } from "@/hooks/UserState";
import { RouteError, useCreateEvent, useEvents } from "@/hooks/swr";
import { CreateEvent } from "@/types/event";

export default function Events() {
  const { data: events } = useEvents();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const scopes = useScopes();

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", my: 2 }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          イベント
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setOpen(true)}
          disabled={!scopes?.write}
        >
          <Add />
        </IconButton>
      </Box>
      {events ? (
        <Grid container spacing={2}>
          {events.map((event) => (
            <Grid item key={event.code}>
              <EventCard
                event={event}
                onClick={() => router.push(`/${event.code}`)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <CircularProgress />
      )}
      {scopes?.write && (
        <CreateEventDialog open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function CreateEventDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { trigger, isMutating } = useCreateEvent();
  const router = useRouter();
  const { error } = useAlert();

  async function onClick(body: CreateEvent) {
    try {
      await trigger(body);
      router.push(`/${body.code}`);
    } catch (e) {
      if ((e as RouteError)?.code === "CONFLICT")
        error("イベントコードが重複しています");
      else error("イベントの作成に失敗しました");
      throw e;
    }
  }

  return (
    <EventDialog
      schema={CreateEvent}
      title="イベントを作成"
      open={open}
      onClose={onClose}
      isMutating={isMutating}
      buttons={[{ label: "作成", needsValidation: true, onClick }]}
    />
  );
}
