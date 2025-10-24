import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.discounts.$discountId";
import { memberContext, prismaContext } from "~/lib/context.server";

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

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
