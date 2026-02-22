import { and, eq } from "drizzle-orm";
import type { Route } from "./+types/route";
import { dbContext, memberContext } from "~/lib/context.server";
import { receipt as receiptTable, event as eventTable } from "~/lib/db.server";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("read");

  const { guildId, eventId } = params;
  const [receipt] = await db
    .select({ id: receiptTable.id })
    .from(receiptTable)
    .innerJoin(eventTable, eq(eventTable.id, receiptTable.eventId))
    .where(and(eq(eventTable.id, eventId), eq(eventTable.guildId, guildId)))
    .limit(1);
  return { hasReceipt: !!receipt };
}
