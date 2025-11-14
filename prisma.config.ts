import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "js",
  async adapter() {
    const { POSTGRES_PRISMA_URL, POSTGRES_CA_URL } = process.env;
    if (!POSTGRES_PRISMA_URL) {
      throw new Error("POSTGRES_PRISMA_URL is not set");
    }
    const url = new URL(POSTGRES_PRISMA_URL);
    const options: PoolConfig = {};

    if (POSTGRES_CA_URL) {
      // https://node-postgres.com/features/ssl#usage-with-connectionstring
      for (const key of url.searchParams.keys()) {
        if (key.startsWith("ssl")) url.searchParams.delete(key);
      }
      options.connectionString = url.toString();

      const res = await fetch(POSTGRES_CA_URL);
      if (!res.ok) throw new Error("Failed to fetch POSTGRES_CA_URL");

      options.ssl = {};
      options.ssl.ca = await res.text();
    } else {
      options.connectionString = url.toString();
    }

    return new PrismaPg(options);
  },
});
