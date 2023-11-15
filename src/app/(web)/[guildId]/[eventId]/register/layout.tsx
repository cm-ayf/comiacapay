"use client";

import { useQuery } from "@apollo/client";
import type { PropsWithChildren, ReactNode } from "react";
import type { Params } from "../params";
import GetEventRegisterQuery from "./GetEventRegister.graphql";
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
  const { data } = useQuery(GetEventRegisterQuery, {
    variables: params,
    ssr: false,
  });
  const title = data && `${data.event.guild.name} / ${data.event.name}`;

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
