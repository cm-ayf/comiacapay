import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.discounts.$discountId";
import { getMemberOr4xx, getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId, discountId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "DELETE": {
      const discount = await prisma.$transaction(async (prisma) => {
        const { discounts } = await prisma.event.findUniqueOrThrow({
          where: { id: eventId, guildId },
          select: { discounts: true },
        });
        await prisma.event.update({
          where: { id: eventId },
          data: {
            discounts: discounts.filter((d) => d.id !== discountId),
          },
        });
        return discounts.find((d) => d.id === discountId);
      });
      return data(discount);
    }
    default:
      throw data(null, 405);
  }
}
