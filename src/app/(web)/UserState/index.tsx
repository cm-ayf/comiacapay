"use client";

import { ApolloError, useQuery } from "@apollo/client";
import Link from "next/link";
import { useEffect, type PropsWithChildren, useState } from "react";
import { useAlert } from "../Alert";
import {
  QueryErrorEvent,
  QuerySuccessEvent,
  QueryUnauthorizedEvent,
  StateChangeEvent,
  UserStateController,
} from "./Controller";
import GetCurrentUser from "./GetCurrentUser.graphql";
import { DOCS } from "@/constant";

const controller = new UserStateController();

export function UserStateProvider({ children }: PropsWithChildren) {
  const { refetch, stopPolling } = useQuery(GetCurrentUser, {
    notifyOnNetworkStatusChange: true,
    pollInterval: 10000,
    onCompleted({ user }) {
      controller.dispatchEvent(new QuerySuccessEvent(user));
    },
    onError(error) {
      if (isSessionError(error)) {
        controller.dispatchEvent(new QueryUnauthorizedEvent(error));
      } else {
        controller.dispatchEvent(new QueryErrorEvent(error));
      }
    },
  });

  useEffect(() => {
    const onSuccess = () => refetch();
    const onUnauthorized = () => stopPolling();
    controller.addEventListener("RefreshSuccess", onSuccess);
    controller.addEventListener("RefreshUnauthorized", onUnauthorized);
    return () => {
      controller.removeEventListener("RefreshSuccess", onSuccess);
      controller.removeEventListener("RefreshUnauthorized", onUnauthorized);
    };
  }, [refetch, stopPolling]);

  useEffect(() => {
    controller.checkUrl();
  }, []);

  const { error } = useAlert();
  useEffect(() => {
    const onUnauthorized = () => error(<SigninErrorMessage />);
    const onError = () => error("サーバーエラーが発生しました");
    controller.addEventListener("QueryError", onError);
    controller.addEventListener("RefreshUnauthorized", onUnauthorized);
    controller.addEventListener("RefreshError", onError);
    controller.addEventListener("RedirectUnauthorized", onUnauthorized);
    controller.addEventListener("RedirectError", onError);
    return () => {
      controller.removeEventListener("QueryError", onError);
      controller.removeEventListener("RefreshUnauthorized", onUnauthorized);
      controller.removeEventListener("RefreshError", onError);
      controller.removeEventListener("RedirectUnauthorized", onUnauthorized);
      controller.removeEventListener("RedirectError", onError);
    };
  }, [error]);

  return children;
}

export function useUserState() {
  const [state, setState] = useState(controller.state);
  useEffect(() => {
    const listener = (event: StateChangeEvent) => setState(event.state);
    controller.addEventListener("StateChange", listener);
    return () => controller.removeEventListener("StateChange", listener);
  });
  return state;
}

export function waitUntilAuthorized() {
  return controller.waitUntilAuthorized();
}

function isSessionError({ networkError }: ApolloError) {
  return (
    networkError &&
    "response" in networkError &&
    networkError.response.status === 401
  );
}

function SigninErrorMessage() {
  return (
    <>
      <Link href="/auth/signin">サインイン</Link>してください（
      <Link href={`${DOCS}/signin.md`} target="_blank">
        マニュアル
      </Link>
      ）
    </>
  );
}
