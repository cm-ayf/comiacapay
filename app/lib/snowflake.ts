const EPOCH = 1420070400000;

declare global {
  /* eslint-disable no-var */
  var _pid: number;
  var _increment: number;
  /* eslint-enable no-var */
}

export function generateSnowflake() {
  const timestamp = BigInt(Date.now() - EPOCH);
  globalThis._pid ??= Math.floor(Math.random() * (1 << 10));
  const pid = BigInt(globalThis._pid);
  globalThis._increment ??= 0;
  const increment = BigInt(globalThis._increment++);
  if (globalThis._increment >= 1 << 12) globalThis._increment = 0;
  return (timestamp << 22n) | (pid << 12n) | increment;
}

export function parseSnowflake(snowflake: bigint | string) {
  snowflake = BigInt(snowflake);
  return {
    timestamp: Number(snowflake >> 22n) + EPOCH,
    pid: Number((snowflake & 0x3ff000n) >> 12n),
    increment: Number(snowflake & 0xfffn),
  };
}
