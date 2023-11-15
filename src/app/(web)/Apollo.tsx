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
import { waitUntilAuthorized } from "./UserState";
import { host } from "@/shared/host";

function retryFetchOnUnauthorized(fetch: typeof window.fetch) {
  return async (input: RequestInfo, init?: RequestInit) => {
    const request = new Request(input, init);
    const isGetCurrentUser =
      new URL(request.url).searchParams.get("operationName") ===
      "GetCurrentUser";

    const response = await fetch(request);
    if (response.status !== 401 || isGetCurrentUser) return response;

    const authorized = await waitUntilAuthorized();
    if (!authorized) return response;

    return await fetch(request);
  };
}

const link = createHttpLink({
  uri: new URL("/graphql", host).toString(),
  fetch: retryFetchOnUnauthorized(fetch),
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
