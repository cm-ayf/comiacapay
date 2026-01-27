import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations.ts";
import * as schema from "./schema.ts";

const client = postgres(process.env["POSTGRES_URL"]!, { prepare: false });
export const db = drizzle({ schema, relations, client });
