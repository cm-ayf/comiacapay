"use client";

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  type FetchResult,
  createHttpLink,
} from "@apollo/client";
import { GraphQLError } from "graphql";
import type { PropsWithChildren } from "react";

const link = createHttpLink({
  uri: new URL("/graphql", process.env["NEXT_PUBLIC_HOST"]).toString(),
  fetchOptions: {
    credentials: "include",
  },
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  ssrMode: typeof window === "undefined",
});

function Apollo({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export { Apollo as ApolloProvider };

export function isGraphQLErrorOf(e: unknown, code: string) {
  return e instanceof GraphQLError && e.extensions["code"] === code;
}

export function assertSuccess<T>(
  result: FetchResult<T>,
): asserts result is FetchResult<T> & { data: T } {
  const { data, errors: [error] = [] } = result;
  if (error) throw error;
  else if (data) return;
  else throw new Error("Unexpected error");
}