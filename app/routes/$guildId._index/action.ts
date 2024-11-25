import { valibotResolver } from "@hookform/resolvers/valibot";
import { redirect } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@vercel/remix";
import { getValidatedBody } from "~/lib/body.server";
import { prisma } from "~/lib/prisma.server";
import { CreateEvent, type CreateEventOutput } from "~/lib/schema";
import { getSession } from "~/lib/session.server";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateEvent);

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const guildId = Snowflake.parse(params["guildId"])?.toString();
  if (!guildId) throw json(null, 400);

  const member = await prisma.member.findUnique({
    where: {
      userId_guildId: { userId: session.userId, guildId },
    },
  });
  if (!member?.write) throw json(null, 404);

  const { errors, data } = await getValidatedBody<CreateEventOutput>(
    request,
    resolver,
  );
  if (errors) throw json({ errors }, 400);

  const { name, date, clone } = data;
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

  return redirect(`/${guildId}/${event.id}`);
}
