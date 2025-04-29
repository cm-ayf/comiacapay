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
  const { userId, register } = context.get(memberContext);
  if (!register) throw data(null, 403);

  const { eventId } = params;
  switch (request.method) {
    case "POST": {
      const { records, ...rest } = await getValidatedBodyOr400(
        request,
        resolver,
      );

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
