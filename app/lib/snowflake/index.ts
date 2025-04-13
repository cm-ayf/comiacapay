import createBigIntConcatenation from "./createBigIntConcatenation";

const { split, build } = createBigIntConcatenation<
  [increment: 12n, pid: 10n, timestamp: 42n]
>([12n, 10n, 42n]);

export class Snowflake {
  private static epoch = 1420070400000;
  private static pid = Math.floor(Math.random() * (1 << 10));
  private static increment = 0;

  static setPid(source: string) {
    const snowflake = this.parse(source);
    if (snowflake) this.pid = snowflake.pid;
  }

  static generate() {
    return new this(this.increment++, this.pid, Date.now() - this.epoch);
  }

  static parse(snowflake: string | null | undefined) {
    if (!snowflake) return null;
    try {
      const source = BigInt(snowflake);
      return new this(source);
    } catch {
      return null;
    }
  }

  readonly source: bigint;

  readonly #timestampOffset: number;
  get timestamp() {
    return this.#timestampOffset + Snowflake.epoch;
  }

  readonly pid: number;
  readonly increment: number;

  private constructor(
    ...args: Parameters<typeof build> | Parameters<typeof split>
  ) {
    switch (args.length) {
      case 1:
        this.source = args[0];
        [this.increment, this.pid, this.#timestampOffset] = split(args[0]);
        break;
      case 3:
        this.source = build(...args);
        [this.increment, this.pid, this.#timestampOffset] = args;
        break;
    }

    if (this.#timestampOffset === 0)
      throw new Error(
        "Timestamp is 0, which means it is not likely a snowflake",
      );
  }

  toString() {
    return this.source.toString();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _Snowflake: typeof Snowflake;
}

globalThis._Snowflake = Snowflake;
