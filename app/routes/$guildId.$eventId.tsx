import { useMemo } from "react";
import { data, type LoaderFunctionArgs } from "react-router";
import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { useGuild } from "./$guildId";
import type { Handle } from "~/lib/handle";
import {
  getMemberOr4xx,
  getSessionOr401,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { EventParams, type ClientDisplay, type ClientItem } from "~/lib/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = parseParamsOr400(EventParams, params);
  await getMemberOr4xx(userId, guildId, "read");

  const event = await prisma.event.findUnique({
    where: { id: eventId, guildId },
    include: { displays: true },
  });

  if (!event) throw data(null, 404);
  return data(event);
}

export const handle: Handle<typeof loader> = {
  breadcrumbLabel: (event) => event?.name,
};

export function useEvent() {
  return useRouteLoaderData<typeof loader>("routes/$guildId.$eventId")!;
}

export function useDisplays() {
  const guild = useGuild();
  const event = useEvent();

  return useMemo(() => {
    const displaysByItemId = new Map(
      event.displays.map((display) => [display.itemId, display]),
    );
    const displays: ClientDisplay[] = [];
    const remainingItems: ClientItem[] = [];
    for (const item of guild.items) {
      const display = displaysByItemId.get(item.id);
      if (display) displays.push({ ...display, item });
      else remainingItems.push(item);
    }
    return { displays, remainingItems };
  }, [guild.items, event.displays]);
}

export default function Page() {
  return <Outlet />;
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return !actionResult?.__neverRevalidate && defaultShouldRevalidate;
}
