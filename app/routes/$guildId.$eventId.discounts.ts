import { data } from "react-router";
import type { Route } from "./+types/$guildId.$eventId.discounts";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { CreateDiscount } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { guildId, eventId } = params;
  switch (request.method) {
    case "POST": {
      const body = await getValidatedFormDataOr400(request, CreateDiscount);

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
