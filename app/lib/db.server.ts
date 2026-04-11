import { PgAsyncRelationalQuery } from "drizzle-orm/pg-core";
import { createDb, type DB } from "../../drizzle";

declare module "drizzle-orm/pg-core" {
  export interface PgAsyncRelationalQuery<TResult> {
    orThrow(error: unknown): Promise<TResult & {}>;
  }
}

PgAsyncRelationalQuery.prototype.orThrow = function (error) {
  return this.then((result) => {
    if (result == null) throw error;
    return result;
  });
};

declare global {
  var db: DB | undefined;
}

export function getDb() {
  return (global.db ??= createDb());
}

export type * from "../../drizzle/schema";
export * as schema from "../../drizzle/schema";
