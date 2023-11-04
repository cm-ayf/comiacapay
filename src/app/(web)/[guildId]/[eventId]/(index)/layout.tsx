"use client";

import { useQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import { Suspense, type ReactNode } from "react";
import type { Params } from "../params";
import GetEventDetailsQuery from "./GetEventDetails.graphql";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export const dynamic = "force-static";

export default function Event({
  params,
  about,
  // discounts,
  displays,
}: {
  params: Params;
  about: ReactNode;
  // discounts: ReactNode;
  displays: ReactNode;
}) {
  const { data } = useQuery(GetEventDetailsQuery, { variables: params });
  const title = data && `${data.event.guild.name} / ${data.event.name}`;
  return (
    <Layout
      navigation={<Navigation title={title} back={`/${params.guildId}`} />}
    >
      <Suspense fallback={<CircularProgress />}>
        {about}
        {/* {discounts} */}
        {displays}
      </Suspense>
    </Layout>
  );
}
