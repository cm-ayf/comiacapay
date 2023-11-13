"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Params } from "../../params";
import GetEventDetailsQuery from "../GetEventDetails.graphql";
import DeleteDisplayMutation from "./DeleteDisplay.graphql";
import UpsertDisplayMutation from "./UpsertDisplay.graphql";
import { useAlert } from "@/app/(web)/Alert";
import { assertSuccess } from "@/app/(web)/Apollo";
import ItemPanel from "@/components/ItemPanel";
import type { UpsertDisplay } from "@/generated/schema";

export const dynamic = "force-static";

interface PartialItem {
  id: string;
  name: string;
  picture: string | null;
}

export default function Displays() {
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetEventDetailsQuery, {
    variables: params,
  });
  const [item, setItem] = useState<CreatingDisplay["item"]>();

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        お品書き
      </Typography>
      <Grid container spacing={2}>
        {data.event.displays.map((display) => (
          <Grid item lg={6} xs={12} key={display.item.id}>
            <ItemPanel item={display.item}>
              <DisplayInner
                me={data.event.guild.me}
                display={display}
                onCreate={() => setItem(undefined)}
              />
            </ItemPanel>
          </Grid>
        ))}
        {data.event.guild.me.write && (
          <Grid item lg={6} xs={12}>
            {item ? (
              <ItemPanel item={item}>
                <DisplayInner
                  me={data.event.guild.me}
                  display={{ item, creating: true }}
                  onCreate={() => setItem(undefined)}
                />
              </ItemPanel>
            ) : (
              <AddDisplaySelect
                items={data.event.guild.items.filter(
                  ({ id }) =>
                    !data.event.displays.some(({ item }) => item.id === id),
                )}
                item={item}
                setItem={setItem}
              />
            )}
          </Grid>
        )}
      </Grid>
    </>
  );
}

type DisplayInner = ViewDisplay | CreatingDisplay;

interface CreatingDisplay {
  item: PartialItem;
  creating: true;
}

function DisplayInner({
  me,
  display,
  onCreate,
}: {
  me: { write: boolean };
  display: DisplayInner;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(display.creating ?? false);

  return open || display.creating ? (
    <UpsertDisplay
      display={display}
      onClose={() => {
        if (display.creating) onCreate();
        setOpen(false);
      }}
    />
  ) : (
    <ViewDisplay display={display} onOpen={() => setOpen(true)} me={me} />
  );
}

function UpsertDisplay({
  display,
  onClose,
}: {
  display: DisplayInner;
  onClose: () => void;
}) {
  const params = useParams<Params>();
  const { success, error } = useAlert();
  const [trigger, { loading }] = useMutation(UpsertDisplayMutation, {
    refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
  });
  const {
    register,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<UpsertDisplay>({
    defaultValues:
      "price" in display
        ? {
            price: display.price,
            internalPrice: display.internalPrice,
            dedication: display.dedication,
          }
        : {},
  });

  async function onSubmit(input: UpsertDisplay) {
    try {
      const result = await trigger({
        variables: { ...params, itemId: display.item.id, input },
      });
      assertSuccess(result);
      success("お品書きを保存しました");
      onClose();
    } catch {
      error("お品書きの保存に失敗しました");
    }
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TextField
          label="価格"
          type="number"
          sx={{ flex: 1 }}
          {...register("price", { required: true, valueAsNumber: true })}
          InputProps={{
            startAdornment: <InputAdornment position="start">¥</InputAdornment>,
          }}
        />
        <TextField
          label="部内頒布価格"
          type="number"
          sx={{ flex: 1 }}
          {...register("internalPrice", { valueAsNumber: true })}
          InputProps={{
            startAdornment: <InputAdornment position="start">¥</InputAdornment>,
          }}
        />
        <FormControlLabel
          sx={{ flex: 1 }}
          control={
            <Checkbox
              {...register("dedication")}
              defaultChecked={!display.creating && display.dedication}
            />
          }
          label="献本あり"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Button onClick={onClose}>キャンセル</Button>
        <LoadingButton
          loading={loading}
          variant="contained"
          disabled={!isValid || ("price" in display && !isDirty)}
          onClick={handleSubmit(onSubmit)}
        >
          保存
        </LoadingButton>
      </Box>
    </>
  );
}

interface ViewDisplay {
  item: PartialItem;
  price: number;
  internalPrice: number | null;
  dedication: boolean;
  creating?: never;
}

function ViewDisplay({
  me,
  display,
  onOpen,
}: {
  me: { write: boolean };
  display: ViewDisplay;
  onOpen: () => void;
}) {
  const params = useParams<Params>();
  const { success, error } = useAlert();
  const [trigger, { loading }] = useMutation(DeleteDisplayMutation, {
    refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
  });

  async function onClick() {
    try {
      const result = await trigger({
        variables: { ...params, itemId: display.item.id },
      });
      assertSuccess(result);
      success("お品書きを削除しました");
    } catch {
      error("お品書きの削除に失敗しました");
    }
  }

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          gap: 1,
          alignItems: "baseline",
        }}
      >
        <Typography sx={{ flex: 1, fontSize: "1.5em" }}>
          ¥{display.price}
        </Typography>
        <Typography sx={{ flex: 1 }}>
          {display.internalPrice !== null && `¥${display.internalPrice} (部内)`}
        </Typography>
        <Typography sx={{ flex: 1 }}>
          {display.dedication && "献本あり"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
        <Button variant="outlined" onClick={onOpen} disabled={!me.write}>
          編集
        </Button>
        <LoadingButton
          variant="outlined"
          loading={loading}
          color="error"
          onClick={onClick}
          disabled={!me.write}
        >
          削除
        </LoadingButton>
      </Box>
    </Box>
  );
}

function AddDisplaySelect({
  items,
  item,
  setItem,
}: {
  items: PartialItem[];
  item?: PartialItem | undefined;
  setItem: (item: PartialItem) => void;
}) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>追加</InputLabel>
      <Select value={item?.id ?? ""} label="追加">
        {items.map((item) => (
          <MenuItem key={item.id} value={item.id} onClick={() => setItem(item)}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
