import { eq } from "drizzle-orm";
import { data } from "react-router";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { schema } from "~/lib/db.server";
import { CreateEvent } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";
import type { Route } from "./+types/route";

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { clone, ...rest } = await getValidatedFormDataOr400(
    request,
    CreateEvent,
  );
  const id = Snowflake.generate().toString();

  return await db.transaction(async (db) => {
    const [event] = await db
      .insert(schema.event)
      .values({ id, guildId, ...rest })
      .returning();
    if (!event) throw data({ code: "NOT_FOUND", model: "Event" }, 404);

    if (clone) {
      const clonedEvent = await db.query.event.findFirst({
        where: { id: clone },
        with: { displays: true },
        columns: { discounts: true },
      });

      if (clonedEvent) {
        await db.insert(schema.display).values(
          clonedEvent.displays.map((display) => ({
            ...display,
            eventId: event.id,
          })),
        );

        await db
          .update(schema.event)
          .set({
            discounts: clonedEvent.discounts.map((discount) => ({
              ...discount,
              id: Snowflake.generate().toString(),
            })),
          })
          .where(eq(schema.event.id, event.id));
      }
    }

    return data(event, 201);
  });
}
