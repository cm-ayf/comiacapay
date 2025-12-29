import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.displays.$itemId";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { UpsertDisplay } from "~/lib/schema";

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, eventId, itemId } = params;
  switch (request.method) {
    case "PUT": {
      const body = await getValidatedFormDataOr400(request, UpsertDisplay);

      // check parent resource belonging guild
      await prisma.item.findUniqueOrThrow({
        where: { id: itemId, guildId },
      });
      await prisma.event.findUniqueOrThrow({
        where: { id: eventId, guildId },
      });

      const display = await prisma.display.upsert({
        where: {
          eventId_itemId: { eventId, itemId },
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
