import { memberContext } from "../$guildId";
import type { Route } from "./+types/route";
import { prismaContext } from "~/root";

export async function loader({ context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, read } = context.get(memberContext);
  if (!read) throw Response.json(null, { status: 403 });

  return await prisma.event.findMany({
    where: { guildId },
    orderBy: { date: "desc" },
    include: { displays: true },
  });
}
