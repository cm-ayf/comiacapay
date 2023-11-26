"use client";

import type { PropsWithChildren, ReactNode } from "react";
import type { Params } from "../params";
import useEventTitle from "../useEventTitle";
import { RegisterProvider } from "./RegisterPage";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export default function Register({
  children,
  params,
  bottom,
}: PropsWithChildren<{
  params: Params;
  bottom: ReactNode;
}>) {
  const title = useEventTitle();

  return (
    <RegisterProvider>
      <Layout
        navigation={
          <Navigation
            title={title}
            back={`/${params.guildId}/${params.eventId}`}
            docs="register"
          />
        }
        bottom={bottom}
      >
        {children}
      </Layout>
    </RegisterProvider>
  );
}
