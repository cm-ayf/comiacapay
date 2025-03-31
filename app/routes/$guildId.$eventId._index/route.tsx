import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useMemo, type ReactNode } from "react";
import { useMember } from "../$guildId";
import { useDisplays, useEvent } from "../$guildId.$eventId";
import CreateSetDiscountDialog from "./CreateSetDiscountDialog";
import MutateEventDialog from "./MutateEventDialog";
import UpsertDisplayDialog, {
  type UpsertDisplayDialogInput,
} from "./UpsertDisplayDialog";
import DisplayCard from "~/components/DisplayPanel";
import EventCard from "~/components/EventCard";
import { LinkComponent } from "~/components/LinkComponent";
import type { ClientEvent, ClientItem } from "~/lib/schema";
import { useSearchParamsState } from "~/lib/search";

export { action } from "./action";

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
  const [edit, setEdit] = useSearchParamsState("edit");

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <EventCard
          event={event}
          onClick={me.write ? () => setEdit("") : undefined}
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
          open={edit !== null}
          onClose={() => setEdit(null)}
          event={event}
        />
      )}
    </>
  );
}

function Displays() {
  const me = useMember();
  const { displays, remainingItems } = useDisplays();

  const [itemId, setItemId] = useSearchParamsState("itemId");
  const display = useMemo<UpsertDisplayDialogInput | undefined>(() => {
    const display = displays.find((display) => display.itemId === itemId);
    if (display) return display;

    const item = remainingItems.find((item) => item.id === itemId);
    if (item) return { item, create: true };

    return undefined;
  }, [remainingItems, itemId, displays]);

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        お品書き
      </Typography>
      <Grid container spacing={16}>
        {displays.map((display) => (
          <Grid key={display.item.id} size={{ xs: 12, lg: 6 }}>
            <DisplayCard display={display}>
              <Button
                onClick={() => setItemId(display.item.id)}
                disabled={!me.write}
              >
                編集
              </Button>
            </DisplayCard>
          </Grid>
        ))}
        {me.write && remainingItems.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <CreateDisplaySelect items={remainingItems} select={setItemId} />
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
  select: (itemId: string) => void;
}) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>追加</InputLabel>
      <Select label="追加" value="">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            onClick={() => select(item.id)}
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
  const [create, setCreate] = useSearchParamsState("create");

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        割引等
      </Typography>
      <Grid container spacing={16}>
        {event.discounts.map((discount) => (
          <Grid key={discount.id} size={{ xs: 12, lg: 6 }}>
            <DiscountCard discount={discount} />
          </Grid>
        ))}
        {me.write && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <CreateDiscountSelect
              select={(typename) => {
                if (typename) {
                  setCreate(typename);
                }
              }}
            />
          </Grid>
        )}
      </Grid>
      {me.write && (
        <CreateSetDiscountDialog
          open={create === "SetDiscount"}
          onClose={() => setCreate(null)}
          displays={displays}
        />
      )}
    </>
  );
}

function CreateDiscountSelect({
  select,
}: {
  select: (__typename: string) => void;
}) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>追加</InputLabel>
      <Select<string>
        label="追加"
        value=""
        onChange={(e) => select(e.target.value)}
      >
        <MenuItem value="SetDiscount" onClick={() => select("SetDiscount")}>
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
    <LoadingButton
      color="error"
      onClick={handleDelete}
      loading={fetcher.state !== "idle"}
      disabled={!me.write}
    >
      割引を削除
    </LoadingButton>
  );
}
