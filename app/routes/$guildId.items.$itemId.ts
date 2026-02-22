import { eq, and } from "drizzle-orm";
import { data } from "react-router";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { schema } from "~/lib/db.server";
import { UpdateItem } from "~/lib/schema";
import type { Route } from "./+types/$guildId.items.$itemId";

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, itemId } = params;
  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedFormDataOr400(request, UpdateItem);

      const [item] = await db
        .update(schema.item)
        .set(body)
        .where(
          and(eq(schema.item.id, itemId), eq(schema.item.guildId, guildId)),
        )
        .returning();
      if (!item) throw data({ code: "NOT_FOUND", model: "Item" }, 404);
      return item;
    }
    case "DELETE": {
      const [item] = await db
        .delete(schema.item)
        .where(
          and(eq(schema.item.id, itemId), eq(schema.item.guildId, guildId)),
        )
        .returning();
      if (!item) throw data({ code: "NOT_FOUND", model: "Item" }, 404);
      Object.assign(item, { delete: true });
      return item;
    }
    default:
      throw data(null, 405);
  }
}
