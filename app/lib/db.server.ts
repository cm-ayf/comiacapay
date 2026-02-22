import { db } from "../../drizzle";
import { PgAsyncRelationalQuery } from "drizzle-orm/pg-core";

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

export type DrizzleDatabase = typeof db;

export * from "../../drizzle/schema";
