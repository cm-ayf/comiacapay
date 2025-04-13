import { valibotResolver } from "@hookform/resolvers/valibot";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
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
      const body = await getValidatedBodyOr400<UpsertDisplayInput>(
        request,
        resolver,
      );

      const display = await prisma.display.upsert({
        where: {
          eventId_itemId: { eventId, itemId },
          event: { guildId },
          item: { guildId },
        },
        create: { eventId, itemId, ...body },
        update: body,
      });

      return data(display, 201);
    }
    case "DELETE": {
      const display = await prisma.display.delete({
        where: {
          eventId_itemId: { eventId, itemId },
          event: { guildId },
          item: { guildId },
        },
      });
      return data(display);
    }
    default:
      throw data(null, 405);
  }
}
