import { memberContext, dbContext } from "~/lib/context.server";
import type { Route } from "./+types/route";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("read");

  return await db.query.event.findMany({
    where: { guildId },
    orderBy: { date: "desc" },
    with: { displays: true },
  });
}
