import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.discounts";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { CreateDiscount } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";
import { event as eventTable } from "~/lib/db.server";
import { eq } from "drizzle-orm";

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, eventId } = params;
  switch (request.method) {
    case "POST": {
      const body = await getValidatedFormDataOr400(request, CreateDiscount);

      const discount = await db.transaction(async (db) => {
        const { discounts } = await db.query.event
          .findFirst({
            where: { id: eventId, guildId },
            columns: { discounts: true },
          })
          .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));
        const id = Snowflake.generate().toString();
        const discount = { id, ...body };
        await db
          .update(eventTable)
          .set({
            discounts: [...discounts, discount],
          })
          .where(eq(eventTable.id, eventId));
        return discount;
      });
      return data(discount, 201);
    }
    default:
      throw data(null, 405);
  }
}
