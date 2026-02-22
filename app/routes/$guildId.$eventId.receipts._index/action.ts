import { data } from "react-router";
import type { InferOutput } from "valibot";
import type { Route } from "./+types/route";
import { getValidatedJsonOr400 } from "~/lib/body.server";
import { memberContext, dbContext } from "~/lib/context.server";
import { CreateReceipts } from "~/lib/schema";
import {
  receipt as receiptTable,
  record as recordTable,
} from "~/lib/db.server";
import { and, eq, inArray } from "drizzle-orm";

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { userId, checkPermission } = await context.get(memberContext);
  checkPermission("register");

  const { guildId, eventId } = params;

  // check parent resource belonging guild
  await db.query.event
    .findFirst({
      where: { id: eventId, guildId },
    })
    .orThrow(data({ code: "NOT_FOUND", model: "Event" }, 404));

  switch (request.method) {
    case "POST": {
      const body = await getValidatedJsonOr400(request, CreateReceipts);

      return await db.transaction(async (db) => {
        // insert receipts
        const insertResult = await db
          .insert(receiptTable)
          .values(
            body.map(({ id, total }) => ({
              id,
              eventId,
              userId,
              total,
            })),
          )
          .onConflictDoNothing();

        // insert records
        await db
          .insert(recordTable)
          .values(Array.from(flatRecords(eventId, body)))
          .onConflictDoNothing();

        return insertResult;
      });
    }
    case "DELETE": {
      const url = new URL(request.url);
      const targetIds = url.searchParams.getAll("id");
      if (targetIds.length === 0) throw data({ code: "BAD_REQUEST" }, 400);

      return await db.transaction(async (db) => {
        await db
          .delete(recordTable)
          .where(
            and(
              inArray(recordTable.receiptId, targetIds),
              eq(recordTable.eventId, eventId),
            ),
          );
        await db
          .delete(receiptTable)
          .where(
            and(
              inArray(receiptTable.id, targetIds),
              eq(receiptTable.eventId, eventId),
            ),
          );
        return { delete: true };
      });
    }
    default:
      throw data(null, 405);
  }
}

function* flatRecords(
  eventId: string,
  data: InferOutput<typeof CreateReceipts>,
): Generator<typeof recordTable.$inferInsert> {
  for (const receipt of data) {
    for (const record of receipt.records) {
      yield { receiptId: receipt.id, eventId, ...record };
    }
  }
}
