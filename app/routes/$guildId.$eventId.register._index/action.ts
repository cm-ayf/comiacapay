import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Prisma } from "@prisma/client";
import { data } from "react-router";
import type { Route } from "./+types/route";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { CreateReceipt } from "~/lib/schema";

const resolver = valibotResolver(CreateReceipt);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "register");

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
