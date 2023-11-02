"use client";

import { useMutation } from "@apollo/client";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { GraphQLError } from "graphql";
import { useState } from "react";
import { useAlert } from "../../Alert";
import { assertSuccess, isGraphQLErrorOf } from "../../Apollo";
import CreateItemMutation from "./CreateItem.graphql";
import DeleteItemMutation from "./DeleteItem.graphql";
import UpdateItemMutation from "./UpdateItem.graphql";
import ItemCard from "@/components/ItemCard";
import ItemDialog from "@/components/ItemDialog";
import type { Item, Member } from "@/generated/resolvers";
import type { CreateItem, UpdateItem } from "@/generated/schema";

export default function Items({ data, me }: { data: Item[]; me: Member }) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Item>();

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", my: 2 }}>
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
        {data.map((item) => (
          <Grid item key={item.id}>
            <ItemCard
              item={item}
              {...(me.write ? { onClick: () => setItem(item) } : {})}
            />
          </Grid>
        ))}
      </Grid>
      {me.write && (
        <CreateItemDialog
          open={open}
          onClose={() => setOpen(false)}
          guildId={me.guildId}
        />
      )}
      {me.write && (
        <MutateItemDialog
          item={item}
          onClose={() => setItem(undefined)}
          guildId={me.guildId}
        />
      )}
    </>
  );
}

function CreateItemDialog({
  open,
  onClose,
  guildId,
}: {
  open: boolean;
  onClose: () => void;
  guildId: string;
}) {
  const [trigger, { loading }] = useMutation(CreateItemMutation);
  const { error, success } = useAlert();

  async function onSubmit(input: CreateItem) {
    try {
      await trigger({
        variables: { guildId, input },
      });
      success("商品を作成しました");
      onClose();
    } catch (e) {
      if (e instanceof GraphQLError && e.extensions["code"] === "CONFLICT")
        error("商品コードが重複しています");
      else error("商品の作成に失敗しました");
      throw e;
    }
  }

  return (
    <ItemDialog
      mode="create"
      title="商品を作成"
      open={open}
      onClose={onClose}
      loading={loading}
      onSubmit={onSubmit}
      buttons={[{ submit: true, label: "作成" }]}
    />
  );
}

function MutateItemDialog({
  item,
  onClose,
  guildId,
}: {
  item: Item | undefined;
  onClose: () => void;
  guildId: string;
}) {
  const [triggerUpdate, { loading: isUpdating }] =
    useMutation(UpdateItemMutation);
  const [triggerDelete, { loading: isDeleting }] =
    useMutation(DeleteItemMutation);
  const { error, success } = useAlert();

  async function onSubmit(input: UpdateItem) {
    if (!item) return;
    try {
      const result = await triggerUpdate({
        variables: { guildId, id: item.id, input },
      });
      assertSuccess(result);
      success("商品を更新しました");
      onClose();
    } catch (e) {
      if (isGraphQLErrorOf(e, "CONFILCT")) error("商品コードが重複しています");
      else error("商品の更新に失敗しました");
      throw e;
    }
  }

  async function onDelete() {
    if (!item) return;
    try {
      const result = await triggerDelete({
        variables: { guildId, id: item.id },
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
    item && (
      <ItemDialog
        mode="update"
        title="商品を編集"
        open
        onClose={onClose}
        defaultValues={item}
        loading={isUpdating || isDeleting}
        onSubmit={onSubmit}
        buttons={[
          { submit: true, label: "更新" },
          { label: "削除", color: "error", onClick: onDelete },
        ]}
      />
    )
  );
}
