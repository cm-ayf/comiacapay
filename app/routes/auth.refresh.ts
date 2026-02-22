import type { Route } from "./+types/auth.refresh";
import { dbContext, sessionContext } from "~/lib/context.server";
import { user as userTable, member as memberTable } from "~/lib/db.server";
import { eq, and } from "drizzle-orm";

export async function action({ request, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { userId } = await context.get(sessionContext);
  const now = new Date();

  await db
    .update(userTable)
    .set({ freshUntil: now })
    .where(eq(userTable.id, userId));

  const url = new URL(request.url);
  const guildId = url.searchParams.get("guild_id");
  if (guildId) {
    await db
      .update(memberTable)
      .set({ freshUntil: now })
      .where(
        and(eq(memberTable.userId, userId), eq(memberTable.guildId, guildId)),
      );
  }
}
