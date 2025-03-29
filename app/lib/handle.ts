import type { Breakpoint } from "@pigment-css/react";
import { useMatches, type UIMatch } from "@remix-run/react";
import type { SerializeFrom } from "@vercel/remix";
import type { FC } from "react";

export interface Handle<AppData> {
  containerMaxWidth?: Breakpoint | false;
  ButtomComponent?: FC;
  breadcrumbLabel?: (data?: SerializeFrom<AppData>) => string | undefined;
}

type Match<AppData> = UIMatch<AppData, Handle<AppData> | undefined>;

export function useContainerMaxWidth() {
  const matches = useMatches() as Match<unknown>[];
  const match = matches.at(-1)!;
  return match.handle?.containerMaxWidth ?? "lg";
}

export function useButtomComponent() {
  const matches = useMatches() as Match<unknown>[];
  const match = matches.at(-1)!;
  return match.handle?.ButtomComponent;
}

export function useBreadcrumbs() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches = useMatches() as Match<any>[];
  const breadcrumbs = matches
    .map(<AppData>(match: Match<AppData>) => {
      const label = match.handle?.breadcrumbLabel?.(match.data);
      if (label) return { href: match.pathname, label };
      else return null;
    })
    .filter((breadcrumb) => !!breadcrumb);
  return breadcrumbs;
}
