import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.displays.$itemId";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { UpsertDisplay } from "~/lib/schema";
import { schema } from "~/lib/db.server";
import { and, eq } from "drizzle-orm";

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, eventId, itemId } = params;
  // check parent resource belonging guild
  await db.query.item
    .findFirst({
      where: { id: itemId, guildId },
    })
    .orThrow(data({ code: "NOT_FOUND", model: "Item" }, 404));
  await db.query.event
    .findFirst({
      where: { id: eventId, guildId },
    })
    .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));

  switch (request.method) {
    case "PUT": {
      const body = await getValidatedFormDataOr400(request, UpsertDisplay);
      const [display] = await db
        .insert(schema.display)
        .values({ eventId, itemId, ...body })
        .onConflictDoUpdate({
          target: [schema.display.eventId, schema.display.itemId],
          set: body,
        })
        .returning();

      if (!display) throw data({ code: "NOT_FOUND", model: "Display" }, 404);
      return display;
    }
    case "DELETE": {
      const [display] = await db
        .delete(schema.display)
        .where(
          and(
            eq(schema.display.eventId, eventId),
            eq(schema.display.itemId, itemId),
          ),
        )
        .returning();
      if (!display) throw data({ code: "NOT_FOUND", model: "Display" }, 404);
      Object.assign(display, { delete: true });
      return display;
    }
    default:
      throw data(null, 405);
  }
}
