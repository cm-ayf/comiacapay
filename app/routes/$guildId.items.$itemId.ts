import { data } from "react-router";
import type { Route } from "./+types/$guildId.items.$itemId";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { UpdateItem } from "~/lib/schema";

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, itemId } = params;
  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedFormDataOr400(request, UpdateItem);

      return await prisma.item.update({
        where: { id: itemId, guildId },
        data: body,
      });
    }
    case "DELETE": {
      const item = await prisma.item.delete({
        where: { id: itemId, guildId },
      });
      Object.assign(item, { delete: true });
      return item;
    }
    default:
      throw data(null, 405);
  }
}
