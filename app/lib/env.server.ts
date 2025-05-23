import { exactOptional, object, parse, string } from "valibot";

const EnvSchema = object({
  DISCORD_CLIENT_ID: string(),
  DISCORD_CLIENT_SECRET: string(),
  DISCORD_OAUTH2_ORIGIN: string(),
  DISCORD_OAUTH2_TRAMPOLINE_KEY: exactOptional(string()),
});

export const env = parse(EnvSchema, process.env);
