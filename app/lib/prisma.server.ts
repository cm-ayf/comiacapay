import { Prisma, PrismaClient, type PrismaPromise } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";

// union of one
export type Discount = SetDiscount;

export interface SetDiscount {
  // was originated from GraphQL
  __typename: "SetDiscount";
  id: string;
  itemIds: string[];
  amount: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type TokenResult = RESTPostOAuth2AccessTokenResult;
    type Discounts = Discount[];
  }
}

export interface ExpectHandler {
  [code: `P${number}`]: (error: PrismaClientKnownRequestError) => unknown;
}

declare module "@prisma/client/runtime/library" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface PrismaPromise<T> {
    expect(handler: ExpectHandler): this;
  }
}

function handle(error: unknown, handler: ExpectHandler): unknown {
  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code.startsWith("P")
  ) {
    const code = error.code as `P${number}`;
    if (handler[code]) return handler[code](error);
  }
  return error;
}

function extendPrismaPromise<T>(promise: PrismaPromise<T>) {
  const handler: ExpectHandler = {};
  const self = new Proxy(promise, {
    get(target, p, receiver) {
      switch (p) {
        case "expect": {
          return (h: ExpectHandler) => {
            Object.assign(handler, h);
            return self;
          };
        }
        case "then": {
          const then = Reflect.get(target, p, receiver);
          return ((onfulfilled, onrejected) =>
            then(
              onfulfilled,
              onrejected &&
                ((reason: unknown) => onrejected(handle(reason, handler))),
            )) satisfies typeof then;
        }
        case "catch": {
          const _catch = Reflect.get(target, p, receiver);
          return ((onrejected) =>
            _catch(
              onrejected &&
                ((reason: unknown) => onrejected(handle(reason, handler))),
            )) satisfies typeof _catch;
        }
        case "finally": {
          const _finally = Reflect.get(target, p, receiver);
          return ((onfinally) =>
            _finally(onfinally).catch((reason) => {
              throw handle(reason, handler);
            })) satisfies typeof _finally;
        }
        default: {
          const method = Reflect.get(target, p, receiver);
          if (typeof method !== "function") return method;
          return (...args: unknown[]) => {
            const ret = method(...args);
            if (ret?.[Symbol.toStringTag] !== "PrismaPromise") return ret;
            return extendPrismaPromise(ret);
          };
        }
      }
    },
  });
  return self;
}

const expectExtension = Prisma.defineExtension({
  name: "expect",
  query: {
    $allOperations({ query, args }) {
      return extendPrismaPromise(query(args));
    },
  },
});

export const { prisma } = Object.assign(global, {
  prisma: new PrismaClient().$extends(expectExtension),
});
