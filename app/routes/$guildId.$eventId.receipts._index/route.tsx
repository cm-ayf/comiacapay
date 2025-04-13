import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Box from "@pigment-css/react/Box";
import Container from "@pigment-css/react/Container";
import { useFetcher, useParams, useRevalidator } from "@remix-run/react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import Summary from "./Summary";
import Table from "./Table";
import type { Handle } from "~/lib/handle";

export { action } from "./action";
export { loader } from "./loader";

export const handle: Handle<unknown> = {
  breadcrumbLabel: () => "購入履歴",
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
      <PageContext.Provider value={{ tab, setTab, selected, setSelected }}>
        {children}
      </PageContext.Provider>
    </TabContext>
  );
}

function TopComponent() {
  const { tab, setTab, selected } = useContext(PageContext);

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

export default function Page() {
  const { selected, setSelected } = useContext(PageContext);
  return (
    <>
      <TabPanel value="summary" sx={{ p: 0, height: "100%" }}>
        <Summary />
      </TabPanel>
      <TabPanel value="table" sx={{ p: 0, height: "100%" }}>
        <Table selected={selected} setSelected={setSelected} />
      </TabPanel>
    </>
  );
}

function Buttons({ selected }: { selected: string[] | null }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", padding: 1, gap: 1 }}>
      <Box sx={{ flex: 1 }} />
      {selected && <DeleteButton selected={selected} />}
      {/* <PushButton /> */}
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
