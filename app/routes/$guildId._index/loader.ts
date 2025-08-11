import { data } from "react-router";
import { memberContext } from "../$guildId";
import type { Route } from "./+types/route";
import { prismaContext } from "~/root";

export async function loader({ context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, read } = await context.get(memberContext);
  if (!read) throw data({ code: "FORBIDDEN", permission: "read" }, 403);

  return await prisma.event.findMany({
    where: { guildId },
    orderBy: { date: "desc" },
    include: { displays: true },
  });
}
