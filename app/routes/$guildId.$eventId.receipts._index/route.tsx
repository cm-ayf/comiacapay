import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import Box from "@mui/material-pigment-css/Box";
import { Suspense, useCallback, useState } from "react";
import {
  useFetcher,
  useParams,
  useRevalidator,
  useRouteLoaderData,
} from "react-router";
import Summary from "./Summary";
import type { action } from "./action";
import type { clientLoader } from "./clientLoader";
import type { loader } from "./loader";
import { dynamic } from "~/lib/dynamic";

export { action } from "./action";
export { clientAction } from "./clientAction";
export { loader } from "./loader";
export { clientLoader } from "./clientLoader";

const Table = dynamic(() => import("./Table"));
export default function Page() {
  const [tab, setTab] = useState<"summary" | "table">("summary");
  // TODO: get rid of emotion to have `p: 0` working
  return (
    <TabContext value={tab}>
      <Box
        sx={{
          marginTop: -2,
          marginInline: -3,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TabList onChange={(_, value) => setTab(value)}>
          <Tab label="概要" value="summary" />
          <Tab label="表" value="table" />
        </TabList>
        <Buttons />
      </Box>
      <TabPanel value="summary" sx={{ p: 0, height: "100%" }}>
        <Summary />
      </TabPanel>
      <TabPanel value="table" sx={{ p: 0, height: "100%" }}>
        <Suspense fallback={<CircularProgress />}>
          <Table />
        </Suspense>
      </TabPanel>
    </TabContext>
  );
}

function Buttons() {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", padding: 1, gap: 1 }}>
      <Box sx={{ flex: 1 }} />
      <PushButton />
      <ReloadButton />
    </Box>
  );
}

function PushButton() {
  // this button is rendered outside of the route context
  const data = useRouteLoaderData<typeof loader | typeof clientLoader>(
    "routes/$guildId.$eventId.receipts._index",
  );
  const { guildId, eventId } = useParams();
  const fetcher = useFetcher<typeof action>();
  const onClick = useCallback(() => {
    if (!data) return;
    fetcher.submit(data.receiptsToBePushed, {
      method: "POST",
      // this button is rendered outside of the route context
      action: `/${guildId}/${eventId}/receipts`,
      encType: "application/json",
    });
  }, [fetcher, guildId, eventId, data]);

  if (!data) return null;

  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={data.receiptsToBePushed.length === 0}
      loading={fetcher.state !== "idle"}
    >
      同期
    </Button>
  );
}

function ReloadButton() {
  const revalidator = useRevalidator();
  return (
    <Button
      variant="contained"
      onClick={() => revalidator.revalidate()}
      loading={revalidator.state === "loading"}
    >
      更新
    </Button>
  );
}
