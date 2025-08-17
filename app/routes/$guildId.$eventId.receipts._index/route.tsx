import styled from "@emotion/styled";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import MuiTabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import Box from "@mui/material-pigment-css/Box";
import { Suspense, useCallback, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import Summary from "./Summary";
import type { action } from "./action";
import type { clientLoader } from "./clientLoader";
import type { loader } from "./loader";
import { dynamic } from "~/lib/dynamic";

export { action } from "./action";
export { clientAction } from "./clientAction";
export { loader } from "./loader";
export { clientLoader } from "./clientLoader";

const Table = dynamic(() => import("./Table.client"));
const Chart = dynamic(() => import("./Chart.client"));
const TabPanel = styled(MuiTabPanel)({ padding: 0, height: "100%" });
export default function Page() {
  const [tab, setTab] = useState<"summary" | "table" | "chart">("summary");
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
          <Tab label="グラフ" value="chart" />
        </TabList>
        <Buttons />
      </Box>

      <TabPanel value="summary">
        <Summary />
      </TabPanel>
      <TabPanel value="table">
        <Suspense
          fallback={<CircularProgress sx={{ m: 4, alignSelf: "center" }} />}
        >
          <Table />
        </Suspense>
      </TabPanel>
      <TabPanel value="chart">
        <Suspense
          fallback={<CircularProgress sx={{ m: 4, alignSelf: "center" }} />}
        >
          <Chart />
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
  const data = useLoaderData<typeof loader | typeof clientLoader>();
  const fetcher = useFetcher<typeof action>();
  const onClick = useCallback(() => {
    if (!data) return;
    fetcher.submit(data.receiptsToBePushed, {
      method: "POST",
      encType: "application/json",
    });
  }, [fetcher, data]);

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
