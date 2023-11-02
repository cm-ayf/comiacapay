"use client";

import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";
import Export from "./Export";
import Summary from "./Summary";
import Table, { SelectedProvider } from "./Table";
import Top from "./Top";
import Layout from "@/app/(web)/Layout";
import { DBStateProvider } from "@/hooks/DBState";
import { useTitle } from "@/hooks/swr";

export const dynamic = "force-static";

export default function Receipts({
  params: { eventcode },
}: {
  params: { eventcode: string };
}) {
  const title = useTitle(eventcode);
  const [tab, setTab] = useState("summary");

  return (
    <DBStateProvider>
      <SelectedProvider>
        <Layout
          scopes={["read"]}
          title={title}
          back={`/${eventcode}`}
          docs="receipts"
          top={<Top eventcode={eventcode} tab={tab} setTab={setTab} />}
        >
          <TabContext value={tab}>
            <TabPanel value="summary" sx={{ p: 0 }}>
              <Summary eventcode={eventcode} />
            </TabPanel>
            <TabPanel value="table" sx={{ p: 0 }}>
              <Table eventcode={eventcode} />
            </TabPanel>
            <TabPanel value="export" sx={{ p: 0 }}>
              <Export eventcode={eventcode} />
            </TabPanel>
          </TabContext>
        </Layout>
      </SelectedProvider>
    </DBStateProvider>
  );
}
