import { useLoaderData } from "react-router";
import type { Route } from "./+types/route";
import { getMemberOr4xx, getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "read");

  return await prisma.receipt.findMany({
    where: { eventId },
    include: { records: true },
  });
}

export function useReceipts() {
  return useLoaderData<typeof loader>();
}
