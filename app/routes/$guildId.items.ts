import { data } from "react-router";
import type { Route } from "./+types/$guildId.items";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { CreateItem } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

export async function action({ request, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("write");

  switch (request.method) {
    case "POST": {
      const body = await getValidatedFormDataOr400(request, CreateItem);

      const id = Snowflake.generate().toString();
      const item = await prisma.item.create({
        data: { id, guildId, ...body },
      });
      return data(item, 201);
    }
    default:
      throw data(null, 405);
  }
}
