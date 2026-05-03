import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { createContext } from "react-router";
import type { DB } from "../../drizzle";
import type { Member, User } from "./db.server";

export interface Thenable<T> {
  then(
    onFulfilled?: (value: T) => void,
    onRejected?: (reason: unknown) => void,
  ): void;
}

export function createThenable<Args extends unknown[], Ret>(
  init: (...args: Args) => Promise<Ret>,
  ...args: Args
): Thenable<Ret> {
  let promise: Promise<Ret>;

  return {
    // oxlint-disable-next-line no-thenable
    then(onFulfilled, onRejected) {
      return (promise ??= init(...args)).then(onFulfilled, onRejected);
    },
  };
}
export const dbContext = createContext<DB>();

export interface SessionContext {
  userId: string;
  tokenResult: RESTPostOAuth2AccessTokenResult;
}
export const sessionContext = createContext<Thenable<SessionContext>>();

export const userContext = createContext<Thenable<User>>();

export interface MemberContext extends Member {
  checkPermission(
    this: void,
    permission: "read" | "register" | "write" | "admin",
  ): void;
}
export const memberContext = createContext<Thenable<MemberContext>>();
