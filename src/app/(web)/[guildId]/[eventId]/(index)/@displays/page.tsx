"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { Params } from "../../params";
import GetEventDetailsQuery from "../GetEventDetails.graphql";
import DeleteDisplayMutation from "./DeleteDisplay.graphql";
import UpsertDisplayMutation from "./UpsertDisplay.graphql";
import { useAlert } from "@/app/(web)/Alert";
import { assertSuccess } from "@/app/(web)/Apollo";
import ItemPanel from "@/components/ItemPanel";

interface PartialDisplay {
  item: { id: string; name: string; picture: string | null };
  price?: number;
}

export default function Displays() {
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetEventDetailsQuery, {
    variables: params,
  });
  const [creating, setCreating] = useState<PartialDisplay["item"]>();
  const displays: PartialDisplay[] = creating
    ? [...data.event.displays, { item: creating }]
    : data.event.displays;

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        お品書き
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {displays.map((display) => (
          <ItemPanel item={display.item} key={display.item.id}>
            <DisplayInner
              display={display}
              onCreate={() => setCreating(undefined)}
            />
          </ItemPanel>
        ))}
      </Box>
      <Select value={creating?.id ?? ""}>
        {data.event.guild.items
          .filter(
            ({ id }) => !data.event.displays.some(({ item }) => item.id === id),
          )
          .map((item) => (
            <MenuItem
              key={item.id}
              value={item.id}
              onClick={() => setCreating(item)}
            >
              {item.name}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}

function DisplayInner({
  display,
  onCreate,
}: {
  display: {
    item: { id: string };
    price?: number;
  };
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(typeof display.price !== "number");

  return open ? (
    <UpsertDisplay
      display={display}
      onClose={() => {
        if (typeof display.price !== "number") onCreate();
        setOpen(false);
      }}
    />
  ) : (
    <ViewDisplay display={display} onOpen={() => setOpen(true)} />
  );
}

function UpsertDisplay({
  display,
  onClose,
}: {
  display: {
    item: { id: string };
    price?: number;
  };
  onClose: () => void;
}) {
  const params = useParams<Params>();
  const { success, error } = useAlert();
  const [trigger, { loading }] = useMutation(UpsertDisplayMutation, {
    refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
  });
  const [price, setPrice] = useState(display.price);

  async function onClick() {
    try {
      if (typeof price !== "number") return;
      const result = await trigger({
        variables: {
          ...params,
          itemId: display.item.id,
          input: { price },
        },
      });
      assertSuccess(result);
      success("お品書きを保存しました");
      onClose();
    } catch {
      error("お品書きの保存に失敗しました");
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <TextField
        label="価格"
        type="number"
        required
        value={price?.toString() ?? ""}
        onChange={(e) => setPrice(parseInt(e.target.value))}
        InputProps={{
          startAdornment: <InputAdornment position="start">¥</InputAdornment>,
        }}
      />
      <Button onClick={onClose}>キャンセル</Button>
      <LoadingButton
        loading={loading}
        variant="contained"
        disabled={typeof price !== "number"}
        onClick={onClick}
      >
        保存
      </LoadingButton>
    </Box>
  );
}

function ViewDisplay({
  display,
  onOpen,
}: {
  display: {
    item: { id: string };
    price?: number;
  };
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
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <Typography fontSize="1.5em">¥{display.price}</Typography>
      <Button onClick={onOpen}>編集</Button>
      <LoadingButton
        loading={loading}
        variant="contained"
        color="error"
        onClick={onClick}
      >
        削除
      </LoadingButton>
    </Box>
  );
}
