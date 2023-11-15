"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAlert } from "../../../Alert";
import { assertSuccess, isGraphQLErrorOf } from "../../../Apollo";
import GetGuildQuery from "../GetGuild.graphql";
import type { Params } from "../params";
import CreateItemMutation from "./CreateItem.graphql";
import DeleteItemMutation from "./DeleteItem.graphql";
import UpdateItemMutation from "./UpdateItem.graphql";
import ItemCard from "@/components/ItemCard";
import ItemDialog from "@/components/ItemDialog";
import type { Item } from "@/generated/resolvers";
import type { CreateItem, UpdateItem } from "@/generated/schema";

export default function Items() {
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetGuildQuery, { variables: params });
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Item>();
  const { me } = data.guild;

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
      <Grid container spacing={2}>
        {data.guild.items.map((item) => (
          <Grid item key={item.id}>
            <ItemCard
              item={item}
              {...(me.write ? { onClick: () => setItem(item) } : {})}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && (
        <CreateItemDialog open={open} onClose={() => setOpen(false)} />
      )}
      {me.write && item && (
        <MutateItemDialog item={item} onClose={() => setItem(undefined)} />
      )}
    </>
  );
}

function CreateItemDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const params = useParams<Params>();
  const [trigger, { loading }] = useMutation(CreateItemMutation, {
    refetchQueries: [{ query: GetGuildQuery, variables: params }],
  });
  const { error, success } = useAlert();

  async function onSubmit(input: CreateItem) {
    try {
      await trigger({
        variables: { ...params, input },
      });
      success("商品を追加しました");
      onClose();
    } catch (e) {
      error("商品の追加に失敗しました");
      throw e;
    }
  }

  return (
    <ItemDialog
      mode="create"
      title="商品を追加"
      open={open}
      onClose={onClose}
      loading={loading}
      onSubmit={onSubmit}
      buttons={[{ submit: true, label: "保存" }]}
    />
  );
}

function MutateItemDialog({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const params = useParams<Params>();
  const [triggerUpdate, { loading: updating }] = useMutation(
    UpdateItemMutation,
    {
      refetchQueries: [{ query: GetGuildQuery, variables: params }],
    },
  );
  const [triggerDelete, { loading: deleting }] = useMutation(
    DeleteItemMutation,
    {
      refetchQueries: [{ query: GetGuildQuery, variables: params }],
    },
  );
  const { error, success } = useAlert();

  async function onUpdate(input: UpdateItem) {
    try {
      const result = await triggerUpdate({
        variables: { ...params, itemId: item.id, input },
      });
      assertSuccess(result);
      success("商品を更新しました");
      onClose();
    } catch (e) {
      error("商品の更新に失敗しました");
      throw e;
    }
  }

  async function onDelete() {
    try {
      const result = await triggerDelete({
        variables: { ...params, itemId: item.id },
      });
      assertSuccess(result);
      success("商品を削除しました");
      onClose();
    } catch (e) {
      if (isGraphQLErrorOf(e, "CONFILCT"))
        error("この商品は1つ以上のイベントのお品書きにあります");
      else error("商品の削除に失敗しました");
      throw e;
    }
  }

  return (
    <ItemDialog
      mode="update"
      title="商品を編集"
      open
      onClose={onClose}
      defaultValues={{
        name: item.name,
        picture: item.picture,
        issuedAt: item.issuedAt,
      }}
      loading={updating || deleting}
      onSubmit={onUpdate}
      buttons={[
        { submit: true, label: "保存" },
        { label: "削除", color: "error", onClick: onDelete },
      ]}
    />
  );
}
