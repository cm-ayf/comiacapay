import { and, eq } from "drizzle-orm";
import { dbContext, memberContext } from "~/lib/context.server";
import { schema } from "~/lib/db.server";
import type { Route } from "./+types/route";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("read");

  const { guildId, eventId } = params;
  const [receipt] = await db
    .select({ id: schema.receipt.id })
    .from(schema.receipt)
    .innerJoin(schema.event, eq(schema.event.id, schema.receipt.eventId))
    .where(and(eq(schema.event.id, eventId), eq(schema.event.guildId, guildId)))
    .limit(1);
  return { hasReceipt: !!receipt };
}
