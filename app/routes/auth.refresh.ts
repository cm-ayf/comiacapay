import type { Route } from "./+types/auth.refresh";
import { dbContext, sessionContext } from "~/lib/context.server";
import { schema } from "~/lib/db.server";
import { eq, and } from "drizzle-orm";

export async function action({ request, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { userId } = await context.get(sessionContext);
  const now = new Date();

  await db
    .update(schema.user)
    .set({ freshUntil: now })
    .where(eq(schema.user.id, userId));

  const url = new URL(request.url);
  const guildId = url.searchParams.get("guild_id");
  if (guildId) {
    await db
      .update(schema.member)
      .set({ freshUntil: now })
      .where(
        and(
          eq(schema.member.userId, userId),
          eq(schema.member.guildId, guildId),
        ),
      );
  }
}
