"use client";

import { useQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import GetGuildQuery from "./GetGuild.graphql";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export interface Params {
  guildId: string;
  [dynamic: string]: string;
}

export default function Home({
  events,
  items,
}: {
  events: ReactNode;
  items: ReactNode;
}) {
  const params = useParams<Params>();
  const { data } = useQuery(GetGuildQuery, { variables: params });

  return (
    <Layout navigation={<Navigation title={data?.guild.name} back="/" />}>
      <ErrorBoundary errorComponent={ErrorComponent}>
        <Suspense fallback={<CircularProgress />}>
          {events}
          {items}
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return JSON.stringify(error);
}
