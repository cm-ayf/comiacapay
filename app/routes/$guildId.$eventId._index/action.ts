import { valibotResolver } from "@hookform/resolvers/valibot";
import { json, redirect, type ActionFunctionArgs } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { EventParams, UpdateEvent, type UpdateEventOutput } from "~/lib/schema";

const resolver = valibotResolver(UpdateEvent);

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = parseParamsOr400(EventParams, params);
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "PATCH": {
      const data = await getValidatedBodyOr400<UpdateEventOutput>(
        request,
        resolver,
      );
      if ("clone" in data) throw json(null, 400);

      await prisma.event.update({
        where: { id: eventId, guildId },
        data,
      });
      return redirect(`/${guildId}/${eventId}`);
    }
    case "DELETE": {
      await prisma.event.delete({
        where: { id: eventId, guildId },
      });
      return redirect(`/${guildId}`);
    }
    default:
      throw json(null, 405);
  }
}
