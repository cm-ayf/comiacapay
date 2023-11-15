"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAlert } from "../../../Alert";
import { assertSuccess } from "../../../Apollo";
import GetGuildQuery from "../GetGuild.graphql";
import type { Params } from "../params";
import CreateEventMutation from "./CreateEvent.graphql";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import type { CreateEvent } from "@/generated/schema";

export const dynamic = "force-static";

export default function Events() {
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetGuildQuery, { variables: params });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { me } = data.guild;

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
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
        {data.guild.events.map((event) => (
          <Grid item key={event.id}>
            <EventCard
              event={event}
              onClick={() => router.push(`/${me.guildId}/${event.id}`)}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && (
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
  const params = useParams<Params>();
  const [trigger, { loading }] = useMutation(CreateEventMutation, {
    refetchQueries: [{ query: GetGuildQuery, variables: params }],
  });
  const router = useRouter();
  const { error } = useAlert();

  async function onSubmit(input: CreateEvent) {
    try {
      const result = await trigger({
        variables: { ...params, input },
      });
      assertSuccess(result);
      router.push(`/${params.guildId}/${result.data.createEvent.id}`);
    } catch (e) {
      error("イベントの追加に失敗しました");
      throw e;
    }
  }

  return (
    <EventDialog
      mode="create"
      title="イベントを追加"
      open={open}
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
      buttons={[{ submit: true, label: "保存" }]}
    />
  );
}
