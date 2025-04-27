import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material-pigment-css/Grid";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { href, Link, useFetcher, useParams } from "react-router";
import { useMember } from "../$guildId";
import { useDisplays, useEvent } from "../$guildId.$eventId";
import CreateSetDiscountDialog from "./CreateSetDiscountDialog";
import MutateEventDialog from "./MutateEventDialog";
import UpsertDisplayDialog, {
  type UpsertDisplayDialogInput,
} from "./UpsertDisplayDialog";
import DisplayCard from "~/components/DisplayPanel";
import EventCard from "~/components/EventCard";
import type { ClientEvent, ClientItem } from "~/lib/schema";

export { loader } from "./loader";

export default function Page() {
  return (
    <>
      <About />
      <Displays />
      <Discounts />
    </>
  );
}

function About() {
  const event = useEvent();
  const me = useMember();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Grid container spacing={16}>
        <Grid size={{ xs: 12, md: 6 }}>
          <EventCard
            event={event}
            onClick={me.write ? () => setOpen(true) : undefined}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            component={Link}
            variant="contained"
            to={href("/:guildId/:eventId/register", {
              guildId: event.guildId,
              eventId: event.id,
            })}
            sx={{ height: "100%" }}
            fullWidth
            disabled={!me.register}
          >
            レジを起動
          </Button>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            component={Link}
            variant="contained"
            to={href("/:guildId/:eventId/receipts", {
              guildId: event.guildId,
              eventId: event.id,
            })}
            sx={{ height: "100%" }}
            fullWidth
          >
            購入履歴
          </Button>
        </Grid>
      </Grid>
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
  const me = useMember();
  const { displays, remainingItems } = useDisplays();
  const [display, setDisplay] = useState<UpsertDisplayDialogInput>();

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        お品書き
      </Typography>
      <Grid container spacing={16}>
        {displays.map((display) => (
          <Grid key={display.item.id} size={{ xs: 12, md: 6 }}>
            <DisplayCard display={display}>
              <Button onClick={() => setDisplay(display)} disabled={!me.write}>
                編集
              </Button>
            </DisplayCard>
          </Grid>
        ))}
        {me.write && remainingItems.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateDisplaySelect
              items={remainingItems}
              setDisplay={setDisplay}
            />
          </Grid>
        )}
      </Grid>
      {me.write && (
        <UpsertDisplayDialog
          display={display}
          onClose={() => setDisplay(undefined)}
        />
      )}
    </>
  );
}

function CreateDisplaySelect({
  items,
  setDisplay,
}: {
  items: ClientItem[];
  setDisplay: (display: { item: ClientItem; create: true }) => void;
}) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>追加</InputLabel>
      <Select label="追加" value="">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            onClick={() => setDisplay({ item, create: true })}
          >
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function Discounts() {
  const event = useEvent();
  const { displays } = useDisplays();
  const me = useMember();
  const [type, setType] = useState<string>();

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        割引等
      </Typography>
      <Grid container spacing={16}>
        {event.discounts.map((discount) => (
          <Grid key={discount.id} size={{ xs: 12, md: 6 }}>
            <DiscountCard discount={discount} />
          </Grid>
        ))}
        {me.write && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateDiscountSelect setType={setType} />
          </Grid>
        )}
      </Grid>
      {me.write && (
        <CreateSetDiscountDialog
          open={type === "SetDiscount"}
          onClose={() => setType(undefined)}
          displays={displays}
        />
      )}
    </>
  );
}

function CreateDiscountSelect({
  setType,
}: {
  setType: (typename: string) => void;
}) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>追加</InputLabel>
      <Select<string> label="追加" value="">
        <MenuItem value="SetDiscount" onClick={() => setType("SetDiscount")}>
          セット割引
        </MenuItem>
      </Select>
    </FormControl>
  );
}

type Discount = ClientEvent["discounts"][number];

function DiscountCard({ discount }: { discount: Discount }): ReactNode & {} {
  switch (discount.__typename) {
    case "SetDiscount":
      return <SetDiscountCard discount={discount} />;
  }
}

function SetDiscountCard({
  discount,
}: {
  discount: Extract<Discount, { __typename: "SetDiscount" }>;
}) {
  const { displays } = useDisplays();

  const summary = useMemo<string>(() => {
    const targetDisplays = discount.itemIds.map((itemId) =>
      displays.find((display) => display.itemId === itemId),
    );

    const itemSummaries = targetDisplays.map((display) =>
      display ? `${display.item.name} (¥${display.price})` : "不明 (¥0)",
    );
    const price = targetDisplays.reduce(
      (acc, display) => (display ? acc + display.price : acc),
      -discount.amount,
    );
    return `${itemSummaries.join(" + ")} - ¥${discount.amount} = ¥${price}`;
  }, [displays, discount]);

  return (
    <Card>
      <CardContent>
        <Typography variant="body1" sx={{ flex: 1 }}>
          セット割引
        </Typography>
        <Typography variant="body1" sx={{ flex: 1 }}>
          {summary}
        </Typography>
      </CardContent>
      <CardActions>
        <DeleteDiscountButton discountId={discount.id} />
      </CardActions>
    </Card>
  );
}

function DeleteDiscountButton({ discountId }: { discountId: string }) {
  const { guildId, eventId } = useParams();
  const fetcher = useFetcher();
  const me = useMember();

  const handleDelete = useCallback(() => {
    fetcher.submit(null, {
      method: "DELETE",
      action: `/${guildId}/${eventId}/discounts/${discountId}`,
    });
  }, [fetcher, guildId, eventId, discountId]);

  return (
    <Button
      color="error"
      onClick={handleDelete}
      loading={fetcher.state !== "idle"}
      disabled={!me.write}
    >
      割引を削除
    </Button>
  );
}
