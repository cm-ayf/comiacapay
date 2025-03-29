import Add from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { useGuild, useMember } from "../$guildId";
import CreateEventDialog from "./CreateEventDialog";
import CreateItemDialog from "./CreateItemDialog";
import MutateItemDialog from "./MutateItemDialog";
import type { loader } from "./loader";
import EventCard from "~/components/EventCard";
import GuildCard from "~/components/GuildCard";
import ItemCard from "~/components/ItemCard";
import { useSearchParamsState } from "~/lib/search";

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

  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <GuildCard guild={guild} member={member} />
    </Box>
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
  const guild = useGuild();
  const me = useMember();
  const [itemId, setItemId] = useSearchParamsState("itemId");
  const item = guild.items.find((item) => item.id === itemId);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          商品
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setItemId("")}
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
              onClick={me.write ? () => setItemId(item.id) : undefined}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && (
        <CreateItemDialog
          open={itemId === ""}
          onClose={() => setItemId(null)}
        />
      )}
      {me.write && (
        <MutateItemDialog item={item} onClose={() => setItemId(null)} />
      )}
    </>
  );
}
