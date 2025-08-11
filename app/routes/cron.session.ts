import type { Route } from "./+types/cron.session";
import { isVercelCronRequest } from "~/lib/cron.server";
import { refreshTokens } from "~/lib/oauth2/auth.server";
import { prismaContext } from "~/root";

export async function loader({ request, context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);

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
      await prisma.session.update({
        where: { id: session.id },
        data: { tokenResult, expires },
      });
    }
  }

  return new Response();
}
