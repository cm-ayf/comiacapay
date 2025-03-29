import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useMemo, useState } from "react";
import { useGuild, useMember } from "../$guildId";
import { useEvent } from "../$guildId.$eventId";
import MutateEventDialog from "./MutateEventDialog";
import UpsertDisplayDialog, {
  type UpsertDisplayDialogInput,
} from "./UpsertDisplayDialog";
import DisplayCard from "~/components/DisplayPanel";
import EventCard from "~/components/EventCard";
import { LinkComponent } from "~/components/LinkComponent";
import type { ClientDisplay, ClientItem } from "~/lib/schema";
import { useSearchParamsState } from "~/lib/search";

export { action } from "./action";

export default function Page() {
  return (
    <>
      <About />
      <Displays />
    </>
  );
}

function About() {
  const event = useEvent();
  const me = useMember();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <EventCard
          event={event}
          onClick={me.write ? () => setOpen(true) : undefined}
        />
        <Button
          LinkComponent={LinkComponent}
          variant="contained"
          href={`/${event.guildId}/${event.id}/register`}
          disabled={!me.register}
        >
          レジを起動
        </Button>
        <Button
          LinkComponent={LinkComponent}
          variant="contained"
          href={`/${event.guildId}/${event.id}/receipts`}
        >
          購入履歴
        </Button>
      </Box>
      {me.write && (
        <MutateEventDialog
          open={open}
          onClose={() => setOpen(false)}
          event={event}
        />
      )}
    </>
  );
}

function Displays() {
  const { items } = useGuild();
  const event = useEvent();
  const me = useMember();

  const { displays, itemsToAdd } = useMemo(() => {
    const displaysMap = new Map(
      event.displays.map((display) => [display.itemId, display]),
    );
    const displays: ClientDisplay[] = [];
    const itemsToAdd: ClientItem[] = [];
    for (const item of items) {
      const display = displaysMap.get(item.id);
      if (display) displays.push({ ...display, item });
      else itemsToAdd.push(item);
    }
    return { displays, itemsToAdd };
  }, [items, event.displays]);

  const [itemId, setItemId] = useSearchParamsState("itemId");
  const display = useMemo<UpsertDisplayDialogInput | undefined>(() => {
    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    const display = displays.find((display) => display.itemId === itemId);
    if (display) return { ...display, item };
    else return { item, create: true };
  }, [items, itemId, displays]);

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        お品書き
      </Typography>
      <Grid container spacing={16}>
        {displays.map((display) => (
          <Grid key={display.item.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <DisplayCard display={display}>
              <Button
                onClick={() => {
                  console.log("click", display.item);
                  setItemId(display.item.id);
                }}
                disabled={!me.write}
              >
                編集
              </Button>
            </DisplayCard>
          </Grid>
        ))}
        {me.write && itemsToAdd.length > 0 && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CreateDisplaySelect
              items={itemsToAdd}
              select={(item) => setItemId(item.id)}
            />
          </Grid>
        )}
      </Grid>
      {me.write && (
        <UpsertDisplayDialog
          display={display}
          onClose={() => setItemId(null)}
        />
      )}
    </>
  );
}

function CreateDisplaySelect({
  items,
  select,
}: {
  items: ClientItem[];
  select: (item: ClientItem) => void;
}) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>追加</InputLabel>
      <Select label="追加" value="">
        {items.map((item) => (
          <MenuItem key={item.id} value={item.id} onClick={() => select(item)}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
