import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Prisma } from "@prisma/client";
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

  const create: Prisma.EventUncheckedCreateInput = { id, guildId, name, date };

  if (clone) {
    const { discounts, displays } = await prisma.event
      .findUniqueOrThrow({
        where: { id: clone, guildId },
        include: { displays: true },
      })
      .expect({
        P2025: () => data({ code: "NOT_FOUND" }, 404),
      });
    create.discounts = discounts.map((discount) => ({
      ...discount,
      id: Snowflake.generate().toString(),
    }));
    create.displays = {
      create: displays.map((display) => ({
        ...display,
        id: Snowflake.generate().toString(),
      })),
    };
  }

  const event = await prisma.event.create({
    data: create,
  });

  return data(event, 201);
}
