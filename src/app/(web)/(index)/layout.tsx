"use client";

import type { PropsWithChildren } from "react";
import Navigation from "../Navigation";
import Layout from "@/components/Layout";

export default function Page({ children }: PropsWithChildren) {
  return <Layout navigation={<Navigation />}>{children}</Layout>;
}
