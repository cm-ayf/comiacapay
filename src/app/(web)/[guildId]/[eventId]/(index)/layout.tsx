"use client";

import type { ReactNode } from "react";
import type { Params } from "../params";
import useEventTitle from "../useEventTitle";
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
  const title = useEventTitle();
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
