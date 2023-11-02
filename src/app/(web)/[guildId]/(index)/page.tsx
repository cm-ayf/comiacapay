"use client";

import { useQuery } from "@apollo/client";
import Events from "./Events";
import GetGuildQuery from "./GetGuild.graphql";
import Items from "./Items";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export default function Home() {
  const { data } = useQuery(GetGuildQuery);

  return (
    <Layout navigation={<Navigation />}>
      {data && <Events data={data.guild.events} me={data.guild.me} />}
      {data && <Items data={data.guild.items} me={data.guild.me} />}
    </Layout>
  );
}
