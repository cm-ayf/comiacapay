"use client";

import { useQuery } from "@apollo/client";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { type ReactNode, use, type PropsWithChildren } from "react";
import type { Params } from "../params";
import GetReceipts from "./GetReceiptsPage.graphql";
import { ReceiptsPage, ReceiptsPageProvider } from "./ReceiptsPage";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export const dynamic = "force-static";

export default function Receipts({
  params,
  top,
  summary,
  table,
  export: export_,
}: {
  params: Params;
  top: ReactNode;
  summary: ReactNode;
  table: ReactNode;
  export: ReactNode;
}) {
  const { data } = useQuery(GetReceipts, { variables: params });
  const title = data && `${data.event.guild.name} / ${data.event.name}`;

  return (
    <ReceiptsPageProvider>
      <Layout
        navigation={
          <Navigation
            title={title}
            back={`/${params.guildId}/${params.eventId}`}
            docs="receipts"
          />
        }
        top={top}
      >
        <TabContextProvider>
          <TabPanel value="summary" sx={{ p: 0, height: "100%" }}>
            {summary}
          </TabPanel>
          <TabPanel value="table" sx={{ p: 0, height: "100%" }}>
            {table}
          </TabPanel>
          <TabPanel value="export" sx={{ p: 0, height: "100%" }}>
            {export_}
          </TabPanel>
        </TabContextProvider>
      </Layout>
    </ReceiptsPageProvider>
  );
}

function TabContextProvider({ children }: PropsWithChildren) {
  const { tab } = use(ReceiptsPage);
  return <TabContext value={tab}>{children}</TabContext>;
}
