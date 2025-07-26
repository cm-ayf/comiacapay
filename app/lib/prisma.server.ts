import { PrismaPg } from "@prisma/adapter-pg";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { PoolConfig } from "pg";
import { data } from "react-router";
import { env } from "./env.server";
import { Prisma, PrismaClient } from "~/generated/prisma/client";

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

function mapKnownError(
  error: Prisma.PrismaClientKnownRequestError,
  model: string | undefined,
) {
  switch (error.code) {
    case "P2001": // record does not exist
    case "P2025": // no record found
      return data({ code: "NOT_FOUND", model, meta: error.meta }, 404);
    case "P2002": // unique constraint failed
    case "P2003": // foreign key constraint failed
    case "P2014": // would violate required relation
      return data({ code: "CONFLICT", model, meta: error.meta }, 409);
    default:
      console.error(error);
      return data({ code: "INTERNAL_SERVER_ERROR" }, 500);
  }
}

const mapKnownErrorExtension = Prisma.defineExtension({
  name: "mapKnownError",
  query: {
    $allOperations({ model, args, query }) {
      return query(args).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw mapKnownError(error, model);
        } else {
          console.error(error);
          throw data({ code: "INTERNAL_SERVER_ERROR" }, 500);
        }
      });
    },
  },
});

async function createPgAdapter() {
  const url = new URL(env.POSTGRES_PRISMA_URL);
  const options: PoolConfig = {};

  if (env.POSTGRES_CA_URL) {
    // https://node-postgres.com/features/ssl#usage-with-connectionstring
    for (const key of url.searchParams.keys()) {
      if (key.startsWith("ssl")) url.searchParams.delete(key);
    }
    options.connectionString = url.toString();

    const res = await fetch(env.POSTGRES_CA_URL);
    if (!res.ok) throw new Error("Failed to fetch POSTGRES_CA_URL");

    options.ssl = {};
    options.ssl.ca = await res.text();
  } else {
    options.connectionString = url.toString();
  }

  return new PrismaPg(options);
}

export async function createPrismaClient() {
  const adapter = await createPgAdapter();
  return new PrismaClient({ adapter }).$extends(mapKnownErrorExtension);
}

export type PrismaClientWithExtensions = Awaited<
  ReturnType<typeof createPrismaClient>
>;
