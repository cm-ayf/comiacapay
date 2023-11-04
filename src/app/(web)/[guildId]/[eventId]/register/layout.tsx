"use client";

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import type { Params } from "../params";
import GetEventRegisterQuery from "./GetEventRegister.graphql";
import { RegisterProvider } from "./Register";
import Navigation from "@/app/(web)/Navigation";
import Layout from "@/components/Layout";

export default function Register({
  display,
  bottom,
}: {
  display: ReactNode;
  bottom: ReactNode;
}) {
  const params = useParams<Params>();
  const { data } = useQuery(GetEventRegisterQuery, {
    fetchPolicy: "cache-first",
    variables: params,
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
        {display}
      </Layout>
    </RegisterProvider>
  );
}
