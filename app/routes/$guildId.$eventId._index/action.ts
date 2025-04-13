import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/route";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { UpdateEvent, type UpdateEventOutput } from "~/lib/schema";

const resolver = valibotResolver(UpdateEvent);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PATCH": {
      const body = await getValidatedBodyOr400<UpdateEventOutput>(
        request,
        resolver,
      );
      if ("clone" in body) throw data(null, 400);

      const event = await prisma.event.update({
        where: { id: eventId, guildId },
        data: body,
      });
      return data(event);
    }
    case "DELETE": {
      const event = await prisma.event.delete({
        where: { id: eventId, guildId },
      });
      Object.assign(event, { delete: true, __neverRevalidate: true });
      return data(event);
    }
    default:
      throw data(null, 405);
  }
}
