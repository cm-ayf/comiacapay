import { json, type LoaderFunctionArgs } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { GuildParams } from "~/lib/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId } = parseParamsOr400(GuildParams, params);
  await getMemberOr4xx(userId, guildId, "read");

  const events = await prisma.event.findMany({
    where: { guildId },
    orderBy: { date: "desc" },
  });

  return json(events);
}
