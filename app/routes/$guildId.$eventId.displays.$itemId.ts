import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import { memberContext } from "./$guildId";
import type { Route } from "./+types/$guildId.$eventId.displays.$itemId";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { UpsertDisplay } from "~/lib/schema";
import { prismaContext } from "~/root";

const resolver = valibotResolver(UpsertDisplay);

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { write } = context.get(memberContext);
  if (!write) throw data(null, 403);

  const { guildId, eventId, itemId } = params;
  switch (request.method) {
    case "PUT": {
      const body = await getValidatedBodyOr400(request, resolver);

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
      Object.assign(display, { delete: true });
      return display;
    }
    default:
      throw data(null, 405);
  }
}
