import { valibotResolver } from "@hookform/resolvers/valibot";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { data } from "react-router";
import { memberContext, useGuild } from "./$guildId";
import type { Route } from "./+types/$guildId.$eventId";
import createErrorBoundary from "~/components/createErrorBoundary";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import type { Handle } from "~/lib/handle";
import { UpdateEvent, type ClientDisplay, type ClientItem } from "~/lib/schema";
import { prismaContext } from "~/root";

export async function loader({ params, context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { read } = await context.get(memberContext);
  if (!read) throw data({ code: "FORBIDDEN", permission: "read" }, 403);

  const { guildId, eventId } = params;
  return await prisma.event.findUniqueOrThrow({
    where: { id: eventId, guildId },
    include: { displays: true },
  });
}

const resolver = valibotResolver(UpdateEvent);

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { write } = await context.get(memberContext);
  if (!write) throw data({ code: "FORBIDDEN", permission: "write" }, 403);

  const { guildId, eventId } = params;
  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedBodyOr400(request, resolver);
      if ("clone" in body) throw data({ code: "BAD_REQUEST" }, 400);

      return await prisma.event.update({
        where: { id: eventId, guildId },
        data: body,
        include: { displays: true },
      });
    }
    case "DELETE": {
      const [displays, event] = await prisma.$transaction([
        prisma.display.deleteMany({
          where: { eventId },
        }),
        prisma.event.delete({
          where: { id: eventId, guildId },
        }),
      ]);
      Object.assign(event, { delete: true, __neverRevalidate: true });
      return { ...event, displays };
    }
    default:
      throw data(null, 405);
  }
}

export const handle: Handle<typeof loader> = {
  title: "{1} / {2}",
  getName: (event) => event?.name,
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
