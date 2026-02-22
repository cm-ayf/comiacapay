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

const client = postgres(process.env["POSTGRES_URL"]!, {
  prepare: false,
  ssl: ca ? ({ ca } satisfies ConnectionOptions) : false,
});
export const db = drizzle({ schema, relations, client });
