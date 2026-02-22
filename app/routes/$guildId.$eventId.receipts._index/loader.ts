import { data } from "react-router";
import { memberContext, dbContext } from "~/lib/context.server";
import type { Route } from "./+types/route";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { checkPermission } = await context.get(memberContext);
  checkPermission("read");

  const { guildId, eventId } = params;
  // check parent resource belonging guild
  await db.query.event
    .findFirst({
      where: { id: eventId, guildId },
    })
    .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));

  const receipts = await db.query.receipt.findMany({
    where: { eventId },
    orderBy: { id: "desc" },
    with: { records: true },
  });

  return { receipts, receiptsToBePushed: [] };
}
