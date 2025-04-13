import { valibotResolver } from "@hookform/resolvers/valibot";
import { data, type ActionFunctionArgs } from "react-router";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { CreateEvent, GuildParams, type CreateEventOutput } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateEvent);

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId } = parseParamsOr400(GuildParams, params);
  await getMemberOr4xx(userId, guildId, "write");

  const { name, date, clone } = await getValidatedBodyOr400<CreateEventOutput>(
    request,
    resolver,
  );
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
