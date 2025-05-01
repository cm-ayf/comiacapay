import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.displays.$itemId";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { UpsertDisplay } from "~/lib/schema";

const resolver = valibotResolver(UpsertDisplay);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId, itemId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PUT": {
      const body = await getValidatedBodyOr400(request, resolver);

      // check parent resource belonging guild
      await prisma.item
        .findUniqueOrThrow({
          where: { id: itemId, guildId },
        })
        .expect({
          P2025: () => data({ code: "NOT_FOUND" }, 404),
        });
      await prisma.event
        .findUniqueOrThrow({
          where: { id: eventId, guildId },
        })
        .expect({
          P2025: () => data({ code: "NOT_FOUND" }, 404),
        });

      const display = await prisma.display
        .upsert({
          where: {
            eventId_itemId: { eventId, itemId },
          },
          create: { eventId, itemId, ...body },
          update: body,
        })
        .expect({
          P2025: () => data({ code: "NOT_FOUND" }, 404),
        });

      return data(display, 201);
    }
    case "DELETE": {
      const display = await prisma.display
        .delete({
          where: {
            eventId_itemId: { eventId, itemId },
            event: { guildId },
            item: { guildId },
          },
        })
        .expect({
          P2014: () => data({ code: "CONFLICT" }, 409),
        });
      Object.assign(display, { delete: true });
      return display;
    }
    default:
      throw data(null, 405);
  }
}
