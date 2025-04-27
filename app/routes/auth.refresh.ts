import type { Route } from "./+types/auth.refresh";
import { getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);
  await prisma.user.update({
    where: { id: userId },
    data: { freshUntil: new Date() },
  });
  const url = new URL(request.url);
  const guildId = url.searchParams.get("guild_id");
  if (guildId) {
    await prisma.member.update({
      where: {
        userId_guildId: { userId, guildId },
      },
      data: { freshUntil: new Date() },
    });
  }
}
