import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useImperativeHandle, useRef, useState } from "react";
import { href, Link, useLoaderData } from "react-router";
import EventCard from "~/components/EventCard";
import GuildCard from "~/components/GuildCard";
import ItemCard from "~/components/ItemCard";
import type { ClientItem } from "~/lib/schema";
import { useGuild, useMember } from "../$guildId";
import CreateEventDialog from "./CreateEventDialog";
import CreateItemDialog from "./CreateItemDialog";
import type { loader } from "./loader";
import MutateItemDialog from "./MutateItemDialog";

export { loader } from "./loader";
export { action } from "./action";

export default function Page() {
  return (
    <>
      <GuildCardWrapper />
      <Events />
      <Items />
    </>
  );
}

function GuildCardWrapper() {
  const guild = useGuild();
  const member = useMember();
  const dialogRef = useRef<{ open: () => void }>(null);

  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GuildCard
            guild={guild}
            member={member}
            onClick={member.admin ? () => dialogRef.current?.open() : undefined}
          />
        </Grid>
      </Grid>
      {member.admin && <UpdateGuildDialog ref={dialogRef} guildId={guild.id} />}
    </>
  );
}

function UpdateGuildDialog({
  ref,
  guildId,
}: {
  ref: React.Ref<{ open: () => void }>;
  guildId: string;
}) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>サーバーの設定変更</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          サーバーの設定変更には認証が必要です。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button component={Link} to={`/setup/start?guild_id=${guildId}`}>
          認証
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Events() {
  const events = useLoaderData<typeof loader>();
  const me = useMember();
  const dialogRef = useRef<{ open: () => void }>(null);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          イベント
        </Typography>
        <IconButton
          color="primary"
          onClick={() => dialogRef.current?.open()}
          aria-label="イベントを追加"
          disabled={!me.write}
        >
          <Add />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <EventCard
              event={event}
              to={href("/:guildId/:eventId", {
                guildId: event.guildId,
                eventId: event.id,
              })}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && <CreateEventDialog ref={dialogRef} events={events} />}
    </>
  );
}

function Items() {
  const me = useMember();
  const guild = useGuild();
  const createItemDialogRef = useRef<{ open: () => void }>(null);
  const mutateItemDialogRef = useRef<{ open: (item: ClientItem) => void }>(
    null,
  );

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          商品
        </Typography>
        <IconButton
          color="primary"
          onClick={() => createItemDialogRef.current?.open()}
          disabled={!me.write}
          aria-label="商品を追加"
        >
          <Add />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        {guild.items.map((item) => (
          <Grid key={item.id}>
            <ItemCard
              item={item}
              onClick={
                me.write
                  ? () => mutateItemDialogRef.current?.open(item)
                  : undefined
              }
            />
          </Grid>
        ))}
      </Grid>
      {me.write && <CreateItemDialog ref={createItemDialogRef} />}
      {me.write && <MutateItemDialog ref={mutateItemDialogRef} />}
    </>
  );
}
