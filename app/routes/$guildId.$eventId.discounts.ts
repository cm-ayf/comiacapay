import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import { memberContext } from "./$guildId";
import type { Route } from "./+types/$guildId.$eventId.discounts";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { CreateDiscount } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";
import { prismaContext } from "~/root";

const resolver = valibotResolver(CreateDiscount);

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { write } = await context.get(memberContext);
  if (!write) throw data({ code: "FORBIDDEN", permission: "write" }, 403);

  const { guildId, eventId } = params;
  switch (request.method) {
    case "POST": {
      const body = await getValidatedBodyOr400(request, resolver);

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
