import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { data } from "react-router";
import { useGuild } from "./$guildId";
import type { Route } from "./+types/$guildId.$eventId";
import createErrorBoundary from "~/components/createErrorBoundary";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { dbContext, memberContext } from "~/lib/context.server";
import type { Handle } from "~/lib/handle";
import { UpdateEvent, type ClientDisplay, type ClientItem } from "~/lib/schema";
import { event as eventTable, display as displayTable } from "~/lib/db.server";
import { eq, and } from "drizzle-orm";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("read");

  const { guildId, eventId } = params;
  return await db.query.event
    .findFirst({
      where: { id: eventId, guildId },
      with: { displays: true },
    })
    .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, eventId } = params;
  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedFormDataOr400(request, UpdateEvent);
      if ("clone" in body) throw data({ code: "BAD_REQUEST" }, 400);

      return await db.transaction(async (db) => {
        const [updated] = await db
          .update(eventTable)
          .set(body)
          .where(
            and(eq(eventTable.id, eventId), eq(eventTable.guildId, guildId)),
          )
          .returning();
        if (!updated) throw data({ code: "NOT_FOUND", model: "Event" }, 404);

        const displays = await db.query.display.findMany({
          where: { eventId },
        });

        return { ...updated, displays };
      });
    }
    case "DELETE": {
      return await db.transaction(async (db) => {
        const displays = await db
          .delete(displayTable)
          .where(eq(displayTable.eventId, eventId))
          .returning();

        const [event] = await db
          .delete(eventTable)
          .where(
            and(eq(eventTable.id, eventId), eq(eventTable.guildId, guildId)),
          )
          .returning();
        if (!event) throw data({ code: "NOT_FOUND", model: "Event" }, 404);

        Object.assign(event, { delete: true, __neverRevalidate: true });
        return { ...event, displays };
      });
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
