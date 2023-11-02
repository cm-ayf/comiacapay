"use client";

import { useMutation } from "@apollo/client";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAlert } from "../../Alert";
import { assertSuccess, isGraphQLErrorOf } from "../../Apollo";
import CreateEventMutation from "./CreateEvent.graphql";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import type { Event, Member } from "@/generated/resolvers";
import type { CreateEvent } from "@/generated/schema";

export default function Events({
  data,
  me,
}: {
  data: Omit<Event, "discounts">[];
  me: Member;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", my: 2 }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          イベント
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setOpen(true)}
          disabled={!me.write}
        >
          <Add />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        {data.map((event) => (
          <Grid item key={event.id}>
            <EventCard
              event={event}
              onClick={() => router.push(`./${event.id}`)}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && (
        <CreateEventDialog
          open={open}
          onClose={() => setOpen(false)}
          guildId={me.guildId}
        />
      )}
    </>
  );
}

function CreateEventDialog({
  open,
  onClose,
  guildId,
}: {
  open: boolean;
  onClose: () => void;
  guildId: string;
}) {
  const [trigger, { loading }] = useMutation(CreateEventMutation);
  const router = useRouter();
  const { error } = useAlert();

  async function onSubmit(input: CreateEvent) {
    try {
      const result = await trigger({
        variables: { guildId, input },
      });
      assertSuccess(result);
      router.push(`./${result.data.createEvent.id}`);
    } catch (e) {
      if (isGraphQLErrorOf(e, "CONFLICT"))
        error("イベントコードが重複しています");
      else error("イベントの作成に失敗しました");
      throw e;
    }
  }

  return (
    <EventDialog
      mode="create"
      title="イベントを作成"
      open={open}
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
      buttons={[{ submit: true, label: "作成" }]}
    />
  );
}
