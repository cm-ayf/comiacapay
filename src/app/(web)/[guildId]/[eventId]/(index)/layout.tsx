"use client";

import { useQuery } from "@apollo/client";
import type { ReactNode } from "react";
import type { Params } from "../params";
import GetEventDetailsQuery from "./GetEventDetails.graphql";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export default function Event({
  params,
  about,
  displays,
  discounts,
}: {
  params: Params;
  about: ReactNode;
  displays: ReactNode;
  discounts: ReactNode;
}) {
  const { data } = useQuery(GetEventDetailsQuery, { variables: params });
  const title = data && `${data.event.guild.name} / ${data.event.name}`;
  return (
    <Layout
      navigation={<Navigation title={title} back={`/${params.guildId}`} />}
    >
      {about}
      {displays}
      {discounts}
    </Layout>
  );
}
