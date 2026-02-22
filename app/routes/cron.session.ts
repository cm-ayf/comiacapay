import type { Route } from "./+types/cron.session";
import { dbContext } from "~/lib/context.server";
import { isVercelCronRequest } from "~/lib/cron.server";
import { refreshTokens } from "~/lib/oauth2/auth.server";
import { schema } from "~/lib/db.server";
import { and, eq, gte, isNotNull, lte } from "drizzle-orm";

export async function loader({ request, context }: Route.LoaderArgs) {
  if (!isVercelCronRequest(request))
    return new Response("Unauthorized", { status: 401 });

  const db = context.get(dbContext);

  const now = Date.now();
  const sessions = await db
    .select()
    .from(schema.session)
    .where(
      and(
        lte(schema.session.expires, new Date(now + 86400000)),
        gte(schema.session.expires, new Date(now)),
        isNotNull(schema.session.tokenResult),
      ),
    );
  for (const session of sessions) {
    try {
      const tokenResult = await refreshTokens(session.tokenResult!);
      const expires = new Date(now + tokenResult.expires_in * 1000);
      await db
        .update(schema.session)
        .set({ tokenResult, expires })
        .where(eq(schema.session.id, session.id));
    } catch {}
  }

  await db
    .update(schema.session)
    .set({ tokenResult: null })
    .where(lte(schema.session.expires, new Date(now)));

  return new Response();
}
