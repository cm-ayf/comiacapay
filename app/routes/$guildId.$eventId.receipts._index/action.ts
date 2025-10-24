import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/route";
import type { Prisma } from "~/generated/prisma/client";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { memberContext, prismaContext } from "~/lib/context.server";
import { CreateReceipts, type CreateReceiptsOutput } from "~/lib/schema";

const resolver = valibotResolver(CreateReceipts);

export async function action({ request, params, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { userId, checkPermission } = await context.get(memberContext);
  checkPermission("register");

  const { eventId } = params;
  switch (request.method) {
    case "POST": {
      const body = await getValidatedBodyOr400(request, resolver);

      const [receipt] = await prisma.$transaction([
        prisma.receipt.createMany({
          data: body.map(({ id, total }) => ({ id, eventId, userId, total })),
          skipDuplicates: true,
        }),
        prisma.record.createMany({
          data: Array.from(flatRecords(eventId, body)),
          skipDuplicates: true,
        }),
      ]);

      return data(receipt, 201);
    }
    case "DELETE": {
      const url = new URL(request.url);
      const targetIds = url.searchParams.getAll("id");
      if (targetIds.length === 0) throw data({ code: "BAD_REQUEST" }, 400);

      await prisma.$transaction([
        prisma.record.deleteMany({
          where: {
            receiptId: { in: targetIds },
          },
        }),
        prisma.receipt.deleteMany({
          where: {
            id: { in: targetIds },
          },
        }),
      ]);
      return { delete: true };
    }
    default:
      throw data(null, 405);
  }
}

function* flatRecords(
  eventId: string,
  data: CreateReceiptsOutput,
): Generator<Prisma.RecordCreateManyInput> {
  for (const receipt of data) {
    for (const record of receipt.records) {
      yield { receiptId: receipt.id, eventId, ...record };
    }
  }
}
