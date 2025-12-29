import { data } from "react-router";
import type { Route } from "./+types/route";
import type { Prisma } from "~/generated/prisma/client";
import { getValidatedJsonOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { CreateReceipt } from "~/lib/schema";

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { userId, checkPermission } = await context.get(memberContext);
  checkPermission("register");

  const { guildId, eventId } = params;
  switch (request.method) {
    case "POST": {
      const { id, total, records } = await getValidatedJsonOr400(
        request,
        CreateReceipt,
      );

      // check parent resource belonging guild
      await prisma.event.findUniqueOrThrow({
        where: { id: eventId, guildId },
      });

      const receipt = await prisma.receipt.upsert({
        where: { id },
        create: {
          id,
          total,
          eventId,
          userId,
          records: {
            createMany: {
              data: records.map<Prisma.RecordCreateManyReceiptInput>(
                (record) => ({ ...record, eventId }),
              ),
            },
          },
        },
        update: {},
      });

      return data({ ...receipt, records }, 201);
    }
    default:
      throw data(null, 405);
  }
}
