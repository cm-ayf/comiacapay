import type { Route } from "./+types/route";
import { getMemberOr4xx, getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId } = params;
  await getMemberOr4xx(userId, guildId, "read");

  return await prisma.event.findMany({
    where: { guildId },
    orderBy: { date: "desc" },
    include: { _count: true },
  });
}
