import type { ConnectionOptions } from "node:tls";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";
import * as schema from "./schema";

const caRes = process.env["POSTGRES_CA_URL"]
  ? await fetch(process.env["POSTGRES_CA_URL"])
  : undefined;
if (caRes && !caRes.ok) throw new Error("Failed to fetch POSTGRES_CA_URL");
const ca = await caRes?.text();

export function createDb() {
  const client = postgres(process.env["POSTGRES_URL"]!, {
    prepare: false,
    ssl: ca ? ({ ca } satisfies ConnectionOptions) : false,
  });
  return drizzle({ schema, relations, client });
}
export type DB = Awaited<ReturnType<typeof createDb>>;
