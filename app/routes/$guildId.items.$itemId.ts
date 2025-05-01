import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/$guildId.items.$itemId";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { UpdateItem } from "~/lib/schema";

const resolver = valibotResolver(UpdateItem);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, itemId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedBodyOr400(request, resolver);

      return await prisma.item
        .update({
          where: { id: itemId, guildId },
          data: body,
        })
        .expect({
          P2025: () => data({ code: "NOT_FOUND" }, 404),
        });
    }
    case "DELETE": {
      const item = await prisma.item
        .delete({
          where: { id: itemId, guildId },
        })
        .expect({
          P2014: () => data({ code: "CONFLICT" }, 409),
          P2025: () => data({ code: "NOT_FOUND" }, 404),
        });
      Object.assign(item, { delete: true });
      return item;
    }
    default:
      throw data(null, 405);
  }
}
