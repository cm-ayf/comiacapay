import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.discounts.$discountId";
import { memberContext, dbContext } from "~/lib/context.server";
import { event as eventTable } from "~/lib/db.server";
import { eq } from "drizzle-orm";

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, eventId, discountId } = params;
  switch (request.method) {
    case "DELETE": {
      const discount = await db.transaction(async (db) => {
        const { discounts } = await db.query.event
          .findFirst({
            where: { id: eventId, guildId },
            columns: { discounts: true },
          })
          .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));

        const discount = discounts.find((d) => d.id === discountId);
        if (!discount) throw data({ code: "NOT_FOUND" }, 404);

        await db
          .update(eventTable)
          .set({
            discounts: discounts.filter((d) => d.id !== discountId),
          })
          .where(eq(eventTable.id, eventId));

        return discount;
      });
      Object.assign(discount, { delete: true });
      return discount;
    }
    default:
      throw data(null, 405);
  }
}
