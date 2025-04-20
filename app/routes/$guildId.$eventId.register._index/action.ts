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
import { CreateReceipt, type CreateReceiptOutput } from "~/lib/schema";

const resolver = valibotResolver(CreateReceipt);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "register");

  switch (request.method) {
    case "POST": {
      const { records, ...rest } =
        await getValidatedBodyOr400<CreateReceiptOutput>(request, resolver);

      const receipt = await prisma.receipt.create({
        data: {
          ...rest,
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
      });

      return data({ ...receipt, records }, 201);
    }
    default:
      throw data(null, 405);
  }
}
