import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: "public",
  dbCredentials: {
    url: process.env["POSTGRES_URL_NON_POOLING"]!,
  },
});
