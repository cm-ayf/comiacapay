import type { Route } from "./+types/route";
import { memberContext, prismaContext } from "~/lib/context.server";

export async function loader({ params, context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("read");

  const { guildId, eventId } = params;
  const receipt = await prisma.receipt.findFirst({
    where: {
      event: { id: eventId, guildId },
    },
  });
  return { hasReceipt: !!receipt };
}
