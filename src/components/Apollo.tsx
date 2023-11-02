"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import type { PropsWithChildren } from "react";

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
});

function Apollo({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export { Apollo as ApolloProvider };
