import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/route";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { CreateEvent } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateEvent);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  const { name, date, clone } = await getValidatedBodyOr400(request, resolver);
  const id = Snowflake.generate().toString();
  const event = await prisma.event.create({
    data: {
      id,
      guildId,
      name,
      date: new Date(date),
    },
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
