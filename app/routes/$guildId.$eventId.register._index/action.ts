import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Prisma } from "@prisma/client";
import { data } from "react-router";
import { memberContext } from "../$guildId";
import type { Route } from "./+types/route";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { CreateReceipt } from "~/lib/schema";
import { prismaContext } from "~/root";

const resolver = valibotResolver(CreateReceipt);

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { userId, guildId, checkPermission } = await context.get(memberContext);
  checkPermission("register");

  const { eventId } = params;
  switch (request.method) {
    case "POST": {
      const { id, total, records } = await getValidatedBodyOr400(
        request,
        resolver,
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
