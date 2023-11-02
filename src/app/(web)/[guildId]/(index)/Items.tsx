"use client";

import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import ItemCard from "@/components/ItemCard";
import ItemDialog from "@/components/ItemDialog";
import { useAlert } from "@/hooks/Alert";
import { useScopes } from "@/hooks/UserState";
import {
  RouteError,
  useCreateItem,
  useDeleteItem,
  useItems,
  useUpdateItem,
} from "@/hooks/swr";
import { Item, CreateItem, UpdateItem } from "@/types/item";

export default function Items() {
  const { data: items } = useItems();
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Item>();
  const scopes = useScopes();
  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", my: 2 }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          商品
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setOpen(true)}
          disabled={!scopes?.write}
        >
          <Add />
        </IconButton>
      </Box>
      {items ? (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item key={item.code}>
              <ItemCard
                key={item.code}
                item={item}
                {...(scopes?.write ? { onClick: () => setItem(item) } : {})}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <CircularProgress />
      )}
      {scopes?.write && (
        <CreateItemDialog open={open} onClose={() => setOpen(false)} />
      )}
      {scopes?.write && (
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
  const { trigger, isMutating } = useCreateItem();
  const { error, success } = useAlert();

  async function onClick(body: CreateItem) {
    try {
      await trigger(body);
      success("商品を作成しました");
      onClose();
    } catch (e) {
      if ((e as RouteError)?.code === "CONFLICT")
        error("商品コードが重複しています");
      else error("商品の作成に失敗しました");
      throw e;
    }
  }

  return (
    <ItemDialog
      schema={CreateItem}
      title="商品を作成"
      open={open}
      onClose={onClose}
      isMutating={isMutating}
      buttons={[{ label: "作成", needsValidation: true, onClick }]}
    />
  );
}

function MutateItemDialog({
  item,
  onClose,
}: {
  item: Item | undefined;
  onClose: () => void;
}) {
  const itemcode = item ? item.code : "";
  const { trigger: triggerUpdate, isMutating: isUpdating } = useUpdateItem({
    itemcode,
  });
  const { trigger: triggerDelete, isMutating: isDeleting } = useDeleteItem({
    itemcode,
  });
  const { error, success } = useAlert();

  async function onClickUpdate(body: UpdateItem) {
    try {
      await triggerUpdate(body);
      success("商品を更新しました");
      onClose();
    } catch (e) {
      if ((e as RouteError)?.code === "CONFLICT")
        error("商品コードが重複しています");
      else error("商品の更新に失敗しました");
      throw e;
    }
  }

  async function onClickDelete() {
    try {
      await triggerDelete(null);
      success("商品を削除しました");
      onClose();
    } catch (e) {
      if ((e as RouteError)?.code === "CONFLICT")
        error("この商品は1つ以上のイベントのお品書きにあります");
      else error("商品の削除に失敗しました");
      throw e;
    }
  }

  return (
    <ItemDialog
      schema={UpdateItem}
      title="商品を編集"
      item={item}
      open={Boolean(item)}
      onClose={onClose}
      isMutating={isUpdating || isDeleting}
      buttons={[
        {
          label: "更新",
          needsValidation: true,
          needsUpdate: true,
          onClick: onClickUpdate,
        },
        { label: "削除", color: "error", onClick: onClickDelete },
      ]}
    />
  );
}
