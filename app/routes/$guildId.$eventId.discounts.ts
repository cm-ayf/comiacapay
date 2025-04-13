import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.discounts";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { CreateDiscount, type CreateDiscountInput } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateDiscount);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "POST": {
      const body = await getValidatedBodyOr400<CreateDiscountInput>(
        request,
        resolver,
      );

      const discount = await prisma.$transaction(async (prisma) => {
        const { discounts } = await prisma.event.findUniqueOrThrow({
          where: { id: eventId, guildId },
          select: { discounts: true },
        });
        const id = Snowflake.generate().toString();
        const discount = { id, ...body };
        await prisma.event.update({
          where: { id: eventId },
          data: {
            discounts: [...discounts, discount],
          },
        });
        return discount;
      });
      return data(discount, 201);
    }
    default:
      throw data(null, 405);
  }
}
