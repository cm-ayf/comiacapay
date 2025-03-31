import { valibotResolver } from "@hookform/resolvers/valibot";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import {
  CreateDiscount,
  EventParams,
  type CreateDiscountInput,
} from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateDiscount);

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = parseParamsOr400(EventParams, params);
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "POST": {
      const data = await getValidatedBodyOr400<CreateDiscountInput>(
        request,
        resolver,
      );

      await prisma.$transaction(async (prisma) => {
        const { discounts } = await prisma.event.findUniqueOrThrow({
          where: { id: eventId, guildId },
          select: { discounts: true },
        });
        const id = Snowflake.generate().toString();
        await prisma.event.update({
          where: { id: eventId },
          data: {
            discounts: [...discounts, { id, ...data }],
          },
        });
      });
      return redirect(`/${guildId}/${eventId}`);
    }
    default:
      throw json(null, 405);
  }
}
