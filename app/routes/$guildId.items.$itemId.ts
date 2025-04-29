import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import { memberContext } from "./$guildId";
import type { Route } from "./+types/$guildId.items.$itemId";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { UpdateItem } from "~/lib/schema";
import { prismaContext } from "~/root";

const resolver = valibotResolver(UpdateItem);

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { write } = context.get(memberContext);
  if (!write) throw data(null, 403);

  const { guildId, itemId } = params;
  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedBodyOr400(request, resolver);

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
