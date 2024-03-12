function check<T extends string>(
  env: NodeJS.ProcessEnv,
  keys: T[],
): asserts env is NodeJS.ProcessEnv & Record<T, string> {
  const missing = keys.filter((key) => !(key in env));
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

check(process.env, ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "KEY_PAIR"]);

export const env = process.env;
