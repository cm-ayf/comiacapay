function check<T extends string>(
  env: NodeJS.ProcessEnv,
  keys: T[],
): asserts env is NodeJS.ProcessEnv & Record<T, string> {
  const missing = keys.filter((key) => !(key in env));
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

check(process.env, [
  "DISCORD_OAUTH2_ORIGIN",
  "DISCORD_OAUTH2_TRAMPOLINE_KEY",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
]);

export const env = process.env;
