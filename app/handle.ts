import { useMatches } from "@remix-run/react";
import { useMemo, type FC } from "react";

export interface Handle {
  ButtomComponent?: FC;
}

export function useHandle() {
  const matches = useMatches();
  return useMemo(() => {
    const { handle } = matches.at(-1)!;
    return (handle ?? {}) as Handle;
  }, [matches]);
}
