import type { Route } from "./+types/cron.session";
import { dbContext } from "~/lib/context.server";
import { isVercelCronRequest } from "~/lib/cron.server";
import { refreshTokens } from "~/lib/oauth2/auth.server";
import { session as sessionTable } from "~/lib/db.server";
import { eq } from "drizzle-orm";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);

  if (!isVercelCronRequest(request))
    return new Response("Unauthorized", { status: 401 });

  const now = Date.now();
  const sessions = await db.query.session.findMany();

  for (const session of sessions) {
    if (!session.tokenResult || session.expires.getTime() < now) {
      await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    } else if (session.expires.getTime() < now + 86400000) {
      const tokenResult = await refreshTokens(session.tokenResult);
      const expires = new Date(now + tokenResult.expires_in * 1000);
      await db
        .update(sessionTable)
        .set({ tokenResult, expires })
        .where(eq(sessionTable.id, session.id));
    }
  }

  return new Response();
}
