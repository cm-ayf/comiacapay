"use client";

import { ApolloSandbox } from "@apollo/sandbox/react";
import "./global.css";

export default function Page() {
  return (
    <ApolloSandbox
      initialEndpoint="http://localhost:3000/graphql"
      initialState={{ includeCookies: true }}
    />
  );
}
