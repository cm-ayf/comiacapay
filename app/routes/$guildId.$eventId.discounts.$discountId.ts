import { data, type ActionFunctionArgs } from "react-router";
import {
  getMemberOr4xx,
  getSessionOr401,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { DiscountParams } from "~/lib/schema";

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId, discountId } = parseParamsOr400(
    DiscountParams,
    params,
  );
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
