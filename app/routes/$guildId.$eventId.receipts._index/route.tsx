import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import Box from "@mui/material-pigment-css/Box";
import Container from "@mui/material-pigment-css/Container";
import {
  createContext,
  Suspense,
  use,
  useCallback,
  useState,
  type PropsWithChildren,
} from "react";
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
import type { Handle } from "~/lib/handle";

export { action } from "./action";
export { clientAction } from "./clientAction";
export { loader } from "./loader";
export { clientLoader } from "./clientLoader";

export const handle: Handle<unknown> = {
  PageContextProvider,
  TopComponent,
};

const PageContext = createContext<{
  tab: "summary" | "table";
  setTab: (tab: "summary" | "table") => void;
  selected: string[];
  setSelected: (selected: string[]) => void;
}>({
  tab: "summary",
  setTab: () => {},
  selected: [],
  setSelected: () => {},
});

function PageContextProvider({ children }: PropsWithChildren) {
  const [tab, setTab] = useState<"summary" | "table">("summary");
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <TabContext value={tab}>
      <PageContext value={{ tab, setTab, selected, setSelected }}>
        {children}
      </PageContext>
    </TabContext>
  );
}

function TopComponent() {
  const { tab, setTab, selected } = use(PageContext);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        "@media (max-width: 600px)": { flexDirection: "column-reverse" },
      }}
    >
      <TabList onChange={(_, value) => setTab(value)}>
        <Tab label="概要" value="summary" />
        <Tab label="表" value="table" />
      </TabList>
      <Box sx={{ flex: 1 }} />
      <Buttons selected={tab === "table" ? selected : null} />
    </Container>
  );
}

const Table = dynamic(() => import("./Table"));
export default function Page() {
  const { selected, setSelected } = use(PageContext);
  // TODO: get rid of emotion to have `p: 0` working
  return (
    <>
      <TabPanel value="summary" sx={{ p: 0, height: "100%" }}>
        <Summary />
      </TabPanel>
      <TabPanel value="table" sx={{ p: 0, height: "100%" }}>
        <Suspense fallback={<CircularProgress />}>
          <Table selected={selected} setSelected={setSelected} />
        </Suspense>
      </TabPanel>
    </>
  );
}

function Buttons({ selected }: { selected: string[] | null }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", padding: 1, gap: 1 }}>
      <Box sx={{ flex: 1 }} />
      {selected && <DeleteButton selected={selected} />}
      <PushButton />
      <ReloadButton />
    </Box>
  );
}

function DeleteButton({ selected }: { selected: string[] }) {
  const { guildId, eventId } = useParams();
  const fetcher = useFetcher();

  const onClick = useCallback(() => {
    if (selected.length === 0) return;
    fetcher.submit(null, {
      method: "DELETE",
      action: `/${guildId}/${eventId}/receipts?${new URLSearchParams(selected.map((id) => ["id", id]))}`,
    });
  }, [fetcher, guildId, eventId, selected]);

  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={selected.length === 0}
      loading={fetcher.state !== "idle"}
    >
      履歴を削除
    </Button>
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
