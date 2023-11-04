import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import MuiTabs from "@mui/material/Tabs";
import ReloadButton from "./ReloadButton";
import { DeleteButton } from "./Table";
import { SyncButton } from "@/app/(web)/[guildId]/[eventId]/SyncButton";

export default function Top({
  eventcode,
  tab,
  setTab,
}: {
  eventcode: string;
  tab: string;
  setTab: (tab: string) => void;
}) {
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
      <Buttons eventcode={eventcode} showDelete={tab === "table"} />
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

function Buttons({
  eventcode,
  showDelete,
}: {
  eventcode: string;
  showDelete: boolean;
}) {
  return (
    <Box sx={{ display: "flex", p: 1, gap: 1 }}>
      <Box sx={{ flex: 1 }} />
      {showDelete && <DeleteButton eventcode={eventcode} variant="contained" />}
      <SyncButton eventcode={eventcode} variant="contained" />
      <ReloadButton eventcode={eventcode} variant="contained" />
    </Box>
  );
}
