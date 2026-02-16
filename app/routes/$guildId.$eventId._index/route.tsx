import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useCallback, useId, useMemo, useRef, type ReactNode } from "react";
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
  const dialogRef = useRef<{ open: (event: ClientEvent) => void }>(null);

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <EventCard
            event={event}
            onClick={
              me.write ? () => dialogRef.current?.open(event) : undefined
            }
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
      {me.write && <MutateEventDialog ref={dialogRef} />}
    </>
  );
}

function Displays() {
  const me = useMember();
  const { displays, remainingItems } = useDisplays();
  const dialogRef = useRef<{ open: (input: UpsertDisplayDialogInput) => void }>(
    null,
  );

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        お品書き
      </Typography>
      <Grid container spacing={2}>
        {displays.map((display) => (
          <Grid key={display.item.id} size={{ xs: 12, md: 6 }}>
            <DisplayCard display={display}>
              <Button
                onClick={() => dialogRef.current?.open(display)}
                disabled={!me.write}
              >
                編集
              </Button>
            </DisplayCard>
          </Grid>
        ))}
        {me.write && remainingItems.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateDisplaySelect
              items={remainingItems}
              open={(display) => dialogRef.current?.open(display)}
            />
          </Grid>
        )}
      </Grid>
      {me.write && <UpsertDisplayDialog ref={dialogRef} />}
    </>
  );
}

function CreateDisplaySelect({
  items,
  open,
}: {
  items: ClientItem[];
  open: (display: { item: ClientItem; create: true }) => void;
}) {
  const selectLabelId = useId();
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel id={selectLabelId}>お品書きを追加</InputLabel>
      <Select labelId={selectLabelId} label="お品書きを追加" value="">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            onClick={() => open({ item, create: true })}
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
  const setDiscountDialogRef = useRef<{ open: () => void }>(null);
  const openDialogOfType = useCallback((type: string) => {
    switch (type) {
      case "SetDiscount":
        setDiscountDialogRef.current?.open();
        break;
    }
  }, []);

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        割引等
      </Typography>
      <Grid container spacing={2}>
        {event.discounts.map((discount) => (
          <Grid key={discount.id} size={{ xs: 12, md: 6 }}>
            <DiscountCard discount={discount} />
          </Grid>
        ))}
        {me.write && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateDiscountSelect open={openDialogOfType} />
          </Grid>
        )}
      </Grid>
      {me.write && (
        <CreateSetDiscountDialog
          ref={setDiscountDialogRef}
          displays={displays}
        />
      )}
    </>
  );
}

function CreateDiscountSelect({ open }: { open: (typename: string) => void }) {
  const selectLabelId = useId();
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel id={selectLabelId}>割引等を追加</InputLabel>
      <Select labelId={selectLabelId} label="割引等を追加" value="">
        <MenuItem value="SetDiscount" onClick={() => open("SetDiscount")}>
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
    return fetcher.submit(null, {
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
