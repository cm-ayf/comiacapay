import { data } from "react-router";
import type { Route } from "./+types/route";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { CreateEvent } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

export async function action({ request, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("write");

  const { clone, ...rest } = await getValidatedFormDataOr400(
    request,
    CreateEvent,
  );
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
