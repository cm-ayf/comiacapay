"use client";

import { useMutation } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import MuiTabs from "@mui/material/Tabs";
import { useParams } from "next/navigation";
import { use } from "react";
import PushButton from "../../PushButton";
import type { Params } from "../../params";
import { ReceiptsPage } from "../ReceiptsPage";
import ReloadButton from "../ReloadButton";
import DeleteReceipts from "./DeleteReceipts.graphql";
import { useAlert } from "@/app/(web)/Alert";
import NoSSRSuspense from "@/components/NoSSRSuspense";

export default function Top() {
  const { tab, setTab } = use(ReceiptsPage);
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        "@media (max-width: 600px)": { flexDirection: "column-reverse" },
      }}
    >
      <Tabs tab={tab} setTab={setTab} />
      <Box sx={{ flex: 1 }} />
      <NoSSRSuspense fallback={<CircularProgress />}>
        <Buttons />
      </NoSSRSuspense>
    </Container>
  );
}

function Tabs({ tab, setTab }: { tab: string; setTab: (tab: string) => void }) {
  return (
    <MuiTabs value={tab} onChange={(_, value) => setTab(value)}>
      <Tab label="概要" value="summary" />
      <Tab label="表" value="table" />
      <Tab label="出力" value="export" />
    </MuiTabs>
  );
}

function Buttons() {
  const { tab } = use(ReceiptsPage);
  return (
    <Box sx={{ display: "flex", flexDirection: "row", p: 1, gap: 1 }}>
      <Box sx={{ flex: 1 }} />
      {tab === "table" && <DeleteButton />}
      <PushButton />
      <ReloadButton />
    </Box>
  );
}

function DeleteButton() {
  const params = useParams<Params>();
  const { selected } = use(ReceiptsPage);
  const [trigger, { loading }] = useMutation(DeleteReceipts);
  const { success, error } = useAlert();

  async function onClick() {
    try {
      await trigger({
        variables: { ...params, ids: selected },
      });
      success("履歴を削除しました");
    } catch (e) {
      error("履歴の削除に失敗しました");
    }
  }

  return (
    <LoadingButton
      variant="contained"
      onClick={onClick}
      disabled={selected.length === 0}
      loading={loading}
    >
      履歴を削除
    </LoadingButton>
  );
}
