import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import { memberContext } from "../$guildId";
import type { Route } from "./+types/route";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { CreateEvent } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";
import { prismaContext } from "~/root";

const resolver = valibotResolver(CreateEvent);

export async function action({ request, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, write } = context.get(memberContext);
  if (!write) throw data(null, 403);

  const { clone, ...rest } = await getValidatedBodyOr400(request, resolver);
  const id = Snowflake.generate().toString();
  const event = await prisma.event.create({
    data: { id, guildId, ...rest },
  });

  if (clone) {
    const { discounts, displays } = await prisma.event.findUniqueOrThrow({
      where: { id: clone },
      include: { displays: true },
    });

    await prisma.display.createMany({
      data: displays.map((display) => ({
        ...display,
        eventId: event.id,
      })),
    });

    await prisma.event.update({
      where: { id: event.id },
      data: {
        discounts: discounts.map((discount) => ({
          ...discount,
          id: Snowflake.generate().toString(),
        })),
      },
    });
  }

  return data(event, 201);
}
