import { data } from "react-router";
import { memberContext } from "./$guildId";
import type { Route } from "./+types/$guildId.$eventId.discounts.$discountId";
import { prismaContext } from "~/root";

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { write } = await context.get(memberContext);
  if (!write) throw data(null, 403);

  const { guildId, eventId, discountId } = params;
  switch (request.method) {
    case "DELETE": {
      const discount = await prisma.$transaction(async (prisma) => {
        const { discounts } = await prisma.event.findUniqueOrThrow({
          where: { id: eventId, guildId },
          select: { discounts: true },
        });
        const discount = discounts.find((d) => d.id === discountId);
        if (!discount)
          throw data({ code: "NOT_FOUND", model: "Discount" }, 404);

        await prisma.event.update({
          where: { id: eventId },
          data: {
            discounts: discounts.filter((d) => d.id !== discountId),
          },
        });
        return discount;
      });
      Object.assign(discount, { delete: true });
      return discount;
    }
    default:
      throw data(null, 405);
  }
}
