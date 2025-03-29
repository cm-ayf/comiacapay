import { valibotResolver } from "@hookform/resolvers/valibot";
import { redirect } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { ItemParams, UpdateItem, type UpdateItemOutput } from "~/lib/schema";

const resolver = valibotResolver(UpdateItem);

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, itemId } = parseParamsOr400(ItemParams, params);
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PATCH": {
      const data = await getValidatedBodyOr400<UpdateItemOutput>(
        request,
        resolver,
      );

      await prisma.item.update({
        where: { id: itemId, guildId },
        data,
      });
      return redirect(`/${guildId}`);
    }
    case "DELETE": {
      await prisma.item.delete({
        where: { id: itemId, guildId },
      });
      return redirect(`/${guildId}`);
    }
    default:
      throw json(null, 405);
  }
}
