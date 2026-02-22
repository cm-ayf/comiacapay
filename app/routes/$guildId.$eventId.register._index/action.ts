import { data } from "react-router";
import type { Route } from "./+types/route";
import { getValidatedJsonOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { CreateReceipt } from "~/lib/schema";
import { schema } from "~/lib/db.server";

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { userId, checkPermission } = await context.get(memberContext);
  checkPermission("register");

  const { guildId, eventId } = params;
  switch (request.method) {
    case "POST": {
      const {
        id,
        total,
        records: recordsIn,
      } = await getValidatedJsonOr400(request, CreateReceipt);

      return await db.transaction(async (db) => {
        // check parent resource belonging guild
        await db.query.event
          .findFirst({
            where: { id: eventId, guildId },
          })
          .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));

        // upsert receipt
        const [receipt] = await db
          .insert(schema.receipt)
          .values({ id, eventId, userId, total })
          .onConflictDoNothing()
          .returning();

        // insert records
        const recordsOut = await db
          .insert(schema.record)
          .values(
            recordsIn.map((record) => ({ ...record, receiptId: id, eventId })),
          )
          .onConflictDoNothing()
          .returning();

        return { ...receipt!, records: recordsOut };
      });
    }
    default:
      throw data(null, 405);
  }
}
