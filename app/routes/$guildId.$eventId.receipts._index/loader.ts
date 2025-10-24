import type { Route } from "./+types/route";
import { memberContext, prismaContext } from "~/lib/context.server";

export async function loader({ params, context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("read");

  const { guildId, eventId } = params;
  const receipts = await prisma.receipt.findMany({
    where: {
      event: { id: eventId, guildId },
    },
    orderBy: { id: "desc" },
    include: { records: true },
  });

  return { receipts, receiptsToBePushed: [] };
}
