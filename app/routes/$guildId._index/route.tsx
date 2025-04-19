import Add from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { useGuild, useMember } from "../$guildId";
import CreateEventDialog from "./CreateEventDialog";
import CreateItemDialog from "./CreateItemDialog";
import MutateItemDialog from "./MutateItemDialog";
import type { loader } from "./loader";
import EventCard from "~/components/EventCard";
import GuildCard from "~/components/GuildCard";
import ItemCard from "~/components/ItemCard";
import { LinkComponent } from "~/components/LinkComponent";
import type { ClientItem } from "~/lib/schema";

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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <GuildCard
          guild={guild}
          member={member}
          onClick={member.admin ? () => setOpen(true) : undefined}
        />
      </Box>
      {member.admin && (
        <UpdateGuildDialog
          open={open}
          onClose={() => setOpen(false)}
          guildId={guild.id}
        />
      )}
    </>
  );
}

function UpdateGuildDialog({
  open,
  onClose,
  guildId,
}: {
  open: boolean;
  onClose: () => void;
  guildId: string;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>サーバーの設定変更</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          サーバーの設定変更には認証が必要です。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          LinkComponent={LinkComponent}
          href={`/setup/start?guild_id=${guildId}`}
        >
          認証
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Events() {
  const [open, setOpen] = useState(false);
  const events = useLoaderData<typeof loader>();
  const me = useMember();

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
      <Grid container spacing={16}>
        {events.map((event) => (
          <Grid key={event.id}>
            <EventCard event={event} href={`/${me.guildId}/${event.id}`} />
          </Grid>
        ))}
      </Grid>
      {me.write && (
        <CreateEventDialog
          open={open}
          onClose={() => setOpen(false)}
          events={events}
        />
      )}
    </>
  );
}

function Items() {
  const me = useMember();
  const guild = useGuild();
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ClientItem>();

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          商品
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setOpen(true)}
          disabled={!me.write}
        >
          <Add />
        </IconButton>
      </Box>
      <Grid container spacing={16}>
        {guild.items.map((item) => (
          <Grid key={item.id}>
            <ItemCard
              item={item}
              onClick={me.write ? () => setItem(item) : undefined}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && (
        <CreateItemDialog open={open} onClose={() => setOpen(false)} />
      )}
      {me.write && (
        <MutateItemDialog item={item} onClose={() => setItem(undefined)} />
      )}
    </>
  );
}
