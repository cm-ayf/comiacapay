"use client";

import Edit from "@mui/icons-material/Edit";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import ItemCard from "@/components/ItemCard";
import { useAlert } from "@/hooks/Alert";
import { useScopes } from "@/hooks/UserState";
import { RouteError, useEvent, useItems, useUpdateEvent } from "@/hooks/swr";

export default function Display({ eventcode }: { eventcode: string }) {
  const { data: event } = useEvent({ eventcode });
  const scopes = useScopes();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          お品書き
        </Typography>
        <IconButton
          color="primary"
          sx={{ m: "1em" }}
          onClick={() => setOpen(true)}
          disabled={!scopes?.write}
        >
          <Edit />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        {event?.items.map((item) => (
          <Grid item key={item.code}>
            <ItemCard item={item} />
          </Grid>
        ))}
      </Grid>
      {scopes?.write && (
        <DisplayDialog
          eventcode={eventcode}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function DisplayDialog({
  eventcode,
  open,
  onClose,
}: {
  eventcode: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: event, isLoading } = useEvent({ eventcode });
  const { data: items } = useItems();
  const { trigger, isMutating } = useUpdateEvent({ eventcode });
  const { error, success } = useAlert();
  const defaultDisplays = event?.items.map((i) => i.code) ?? [];
  const [displays, setDisplays] = useState(defaultDisplays);

  useEffect(() => {
    if (isLoading || !event) return;
    setDisplays(event.items.map((i) => i.code));
    // for first state rendering; should only be called once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>お品書きを編集</DialogTitle>
      <DialogContent>
        <DialogContentText></DialogContentText>
        {items?.map((item) => (
          <Box key={item.code} sx={{ display: "flex", alignItems: "center" }}>
            <Typography>{item.name}</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Switch
              key={item.code}
              checked={displays.some((code) => code === item.code)}
              onChange={(e) => {
                if (e.target.checked) setDisplays([...displays, item.code]);
                else setDisplays(displays.filter((i) => i !== item.code));
              }}
              disabled={isMutating}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <LoadingButton
          onClick={async () => {
            try {
              await trigger({ items: displays });
              success("お品書きを更新しました");
              onClose();
            } catch (e) {
              if ((e as RouteError)?.code === "CONFLICT")
                error("この商品はすでに購入されています");
              else error("お品書きの更新に失敗しました");
              throw e;
            }
          }}
          loading={isMutating}
          disabled={
            [...displays].sort().toString() ===
            [...defaultDisplays].sort().toString()
          }
        >
          更新
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
