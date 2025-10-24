import type { RESTPostOAuth2AccessTokenResult } from "node_modules/discord-api-types/rest/v10/oauth2";
import { createContext } from "react-router";
import type { PrismaClientWithExtensions } from "./prisma.server";
import type { Member, User } from "~/generated/prisma/client";

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
    then(onFulfilled, onRejected) {
      return (promise ??= init(...args)).then(onFulfilled, onRejected);
    },
  };
}

export const prismaContext = createContext<PrismaClientWithExtensions>();

export interface SessionContext {
  userId: string;
  tokenResult: RESTPostOAuth2AccessTokenResult;
}
export const sessionContext = createContext<Thenable<SessionContext>>();

export const userContext = createContext<Thenable<User>>();

export interface MemberContext extends Member {
  checkPermission(permission: "read" | "register" | "write" | "admin"): void;
}
export const memberContext = createContext<Thenable<MemberContext>>();
