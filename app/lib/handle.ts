import type { Breakpoint } from "@mui/material-pigment-css";
import { useMemo, type FC } from "react";
import {
  useLoaderData,
  useLocation,
  useMatches as _useMatches,
  type UIMatch,
} from "react-router";

type SerializeFrom<AppData> = ReturnType<typeof useLoaderData<AppData>>;

const useMatches = _useMatches as () => Match<unknown>[];

export interface Handle<AppData> {
  containerMaxWidth?: Breakpoint | false;
  ButtomComponent?: FC;
  title?: string;
  getName?: (data: SerializeFrom<AppData> | undefined) => string | undefined;
}

export type Match<AppData> = UIMatch<
  SerializeFrom<AppData>,
  Handle<AppData> | undefined
>;

export function useHandleValue<K extends keyof Handle<unknown>>(
  key: K,
  fallback: Handle<unknown>[K] & {},
): Handle<unknown>[K] & {} {
  const matches = useMatches();
  const match = matches.at(-1)!;
  const value = match.handle?.[key];
  return useMemo(() => value ?? fallback, [value, fallback]);
}

export interface Breadcrumb {
  href: string;
  name: string;
}

export function useTitle(): string | undefined {
  const matches = useMatches();
  const match = matches.findLast((match) => match.handle?.title);
  return match?.handle?.title?.replace(/\{(\d+)\}/g, (_, i) => {
    const match = matches[i];
    return match?.handle?.getName?.(match?.data) ?? "…";
  });
}

export function useBreadcrumbs() {
  const { pathname } = useLocation();
  const matches = useMatches();
  return matches
    .filter((match) => !match.pathname.startsWith(pathname))
    .toReversed()
    .map<Breadcrumb>((match) => {
      const name = match.handle?.getName?.(match?.data) ?? "…";
      return { href: match.pathname, name };
    });
}
