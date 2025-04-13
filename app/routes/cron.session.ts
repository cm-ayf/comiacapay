import type { LoaderFunctionArgs } from "react-router";
import { isVercelCronRequest } from "~/lib/cron.server";
import { refreshTokens } from "~/lib/oauth2/auth.server";
import { prisma } from "~/lib/prisma.server";
import { upsertUserAndMembers } from "~/lib/sync.server";

export async function loader({ request }: LoaderFunctionArgs) {
  if (!isVercelCronRequest(request))
    return new Response("Unauthorized", { status: 401 });

  const now = Date.now();
  const sessions = await prisma.session.findMany();

  for (const session of sessions) {
    if (!session.tokenResult || session.expires.getTime() < now) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    } else if (session.expires.getTime() < now + 86400000) {
      const tokenResult = await refreshTokens(session.tokenResult);
      const expires = new Date(now + tokenResult.expires_in * 1000);
      const user = await upsertUserAndMembers(tokenResult);
      await prisma.session.update({
        where: { id: session.id },
        data: { userId: user.id, tokenResult, expires },
      });
    }
  }

  return new Response();
}
