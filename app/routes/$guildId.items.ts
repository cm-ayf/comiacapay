import { data } from "react-router";
import type { Route } from "./+types/$guildId.items";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { CreateItem } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";
import { schema } from "~/lib/db.server";

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("write");

  switch (request.method) {
    case "POST": {
      const body = await getValidatedFormDataOr400(request, CreateItem);

      const id = Snowflake.generate().toString();
      const [item] = await db
        .insert(schema.item)
        .values({ id, guildId, ...body })
        .returning();
      return data(item, 201);
    }
    default:
      throw data(null, 405);
  }
}
