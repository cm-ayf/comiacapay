"use client";

import { useQuery } from "@apollo/client";
import type { ReactNode } from "react";
import GetGuildQuery from "./GetGuild.graphql";
import type { Params } from "./params";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export default function Home({
  params,
  events,
  items,
}: {
  params: Params;
  events: ReactNode;
  items: ReactNode;
}) {
  const { data } = useQuery(GetGuildQuery, { variables: params, ssr: false });

  return (
    <Layout navigation={<Navigation title={data?.guild.name} back="/" />}>
      {events}
      {items}
    </Layout>
  );
}
