import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { useGuild } from "./$guildId";
import type { Route } from "./+types/$guildId.$eventId";
import createErrorBoundary from "~/components/createErrorBoundary";
import type { Handle } from "~/lib/handle";
import { getMemberOr4xx, getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { type ClientDisplay, type ClientItem } from "~/lib/schema";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "read");

  return await prisma.event.findUniqueOrThrow({
    where: { id: eventId, guildId },
    include: { displays: true, _count: true },
  });
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

function EventNotFound() {
  return (
    <Typography variant="body1">イベントが見つかりませんでした</Typography>
  );
}

export const ErrorBoundary = createErrorBoundary({ 404: EventNotFound });

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return !actionResult?.__neverRevalidate && defaultShouldRevalidate;
}
