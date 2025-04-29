import type { Route } from "./+types/auth.refresh";
import { prismaContext, sessionContext } from "~/root";

export async function action({ request, context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { userId } = context.get(sessionContext);
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
