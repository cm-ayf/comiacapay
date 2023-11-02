"use client";

import Events from "./Events";
import Items from "./Items";
import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout scopes={["read"]}>
      <Events />
      <Items />
    </Layout>
  );
}
