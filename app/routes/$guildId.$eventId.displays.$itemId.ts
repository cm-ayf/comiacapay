import { valibotResolver } from "@hookform/resolvers/valibot";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import {
  DisplayParams,
  UpsertDisplay,
  type UpsertDisplayInput,
} from "~/lib/schema";

const resolver = valibotResolver(UpsertDisplay);

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId, itemId } = parseParamsOr400(DisplayParams, params);
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PUT": {
      const data = await getValidatedBodyOr400<UpsertDisplayInput>(
        request,
        resolver,
      );

      await prisma.display.upsert({
        where: {
          eventId_itemId: { eventId, itemId },
          event: { guildId },
          item: { guildId },
        },
        create: { eventId, itemId, ...data },
        update: data,
      });
      return redirect(`/${guildId}/${eventId}`);
    }
    case "DELETE": {
      await prisma.display.delete({
        where: {
          eventId_itemId: { eventId, itemId },
          event: { guildId },
          item: { guildId },
        },
      });
      return redirect(`/${guildId}/${eventId}`);
    }
    default:
      throw json(null, 405);
  }
}
