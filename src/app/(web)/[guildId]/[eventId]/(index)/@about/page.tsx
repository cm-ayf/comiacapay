"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { Params } from "../../params";
import GetEventDetailsQuery from "../GetEventDetails.graphql";
import DeleteEventMutation from "./DeleteEvent.graphql";
import UpdateEventMutation from "./UpdateEvent.graphql";
import { useAlert } from "@/app/(web)/Alert";
import { assertSuccess, isGraphQLErrorOf } from "@/app/(web)/Apollo";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import type { DateTime, UpdateEvent } from "@/generated/schema";

export default function About({ params }: { params: Params }) {
  const { data } = useSuspenseQuery(GetEventDetailsQuery, {
    variables: params,
    fetchPolicy: "cache-and-network",
  });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { me } = data.event.guild;

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <EventCard
          event={data.event}
          {...(me.write ? { onClick: () => setOpen(true) } : {})}
        />
        <Button
          variant="contained"
          onClick={() =>
            router.push(`/${params.guildId}/${params.eventId}/register`)
          }
          disabled={!me.register}
        >
          レジを起動
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            router.push(`/${params.guildId}/${params.eventId}/receipts`)
          }
        >
          購入履歴
        </Button>
      </Box>
      {me.write && (
        <UpdateEventDialog
          open={open}
          onClose={() => setOpen(false)}
          event={data.event}
        />
      )}
    </>
  );
}

function UpdateEventDialog({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event: { name: string; date: DateTime };
}) {
  const params = useParams<Params>();
  const [triggerUpdate, { loading: updating }] = useMutation(
    UpdateEventMutation,
    {
      refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
    },
  );
  const [triggerDelete, { loading: deleting }] = useMutation(
    DeleteEventMutation,
    {
      refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
    },
  );
  const router = useRouter();
  const { error, success } = useAlert();

  async function onUpdate(input: UpdateEvent) {
    try {
      const result = await triggerUpdate({
        variables: { ...params, input },
      });
      assertSuccess(result);
      success("イベントを更新しました");
      onClose();
    } catch (e) {
      error("イベントの更新に失敗しました");
      throw e;
    }
  }

  async function onDelete() {
    try {
      const result = await triggerDelete({ variables: params });
      assertSuccess(result);
      router.push(`/${params.guildId}`);
    } catch (e) {
      if (isGraphQLErrorOf(e, "CONFILCT"))
        error("このイベントにはすでに購入履歴があります");
      error("イベントの削除に失敗しました");
      throw e;
    }
  }

  return (
    <EventDialog
      mode="update"
      title="イベントを更新"
      defaultValues={{
        name: event.name,
        date: event.date,
      }}
      open={open}
      onClose={onClose}
      onSubmit={onUpdate}
      loading={updating || deleting}
      buttons={[
        { submit: true, label: "保存" },
        { label: "削除", color: "error", onClick: onDelete },
      ]}
    />
  );
}
