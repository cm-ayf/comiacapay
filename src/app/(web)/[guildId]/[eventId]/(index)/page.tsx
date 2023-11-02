"use client";

import About from "./About";
import Display from "./Display";
import UpdateCalculator from "./UpdateCalculator";
import Layout from "@/components/Layout";
import { useTitle } from "@/hooks/swr";

export const dynamic = "force-static";

export default function Event({
  params: { eventcode },
}: {
  params: { eventcode: string };
}) {
  const title = useTitle(eventcode);

  return (
    <Layout scopes={["read"]} title={title} back="/">
      <About eventcode={eventcode} />
      <UpdateCalculator eventcode={eventcode} />
      <Display eventcode={eventcode} />
    </Layout>
  );
}
