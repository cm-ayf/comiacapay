import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/$guildId.items.$itemId";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { UpdateItem, type UpdateItemOutput } from "~/lib/schema";

const resolver = valibotResolver(UpdateItem);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, itemId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedBodyOr400<UpdateItemOutput>(
        request,
        resolver,
      );

      const item = await prisma.item.update({
        where: { id: itemId, guildId },
        data: body,
      });
      return data(item);
    }
    case "DELETE": {
      const item = await prisma.item.delete({
        where: { id: itemId, guildId },
      });
      return data(item);
    }
    default:
      throw data(null, 405);
  }
}
