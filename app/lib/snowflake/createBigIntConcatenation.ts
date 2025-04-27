export type Parts<Definition extends readonly bigint[] | []> = {
  [I in keyof Definition]: number;
};

function mask(bits: bigint) {
  return (1n << bits) - 1n;
}

export default function createBigIntConcatenation<
  Definition extends readonly bigint[] | [],
>(definition: Definition) {
  const reverseDefinition = definition.slice().reverse() as Definition;
  return {
    split(source: bigint) {
      const parts = [] as { -readonly [I in keyof Definition]: number };
      reverseDefinition.forEach((bits, index: keyof Definition) => {
        parts[index] = Number(source & mask(bits));
        source >>= bits;
      });
      return parts.reverse() as Parts<Definition>;
    },
    build(...parts: Parts<Definition>) {
      let source = 0n;
      definition.forEach((bits, index: keyof Definition) => {
        source <<= bits;
        source |= BigInt(parts[index]) & mask(bits);
      });
      return source;
    },
  };
}
