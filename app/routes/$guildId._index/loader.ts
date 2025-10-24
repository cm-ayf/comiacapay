import type { Route } from "./+types/route";
import { memberContext, prismaContext } from "~/lib/context.server";

export async function loader({ context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("read");

  return await prisma.event.findMany({
    where: { guildId },
    orderBy: { date: "desc" },
    include: { displays: true },
  });
}
