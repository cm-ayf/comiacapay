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
import { CreateReceipts, type CreateReceiptsOutput } from "~/lib/schema";

const resolver = valibotResolver(CreateReceipts);

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = params;
  await getMemberOr4xx(userId, guildId, "register");

  await prisma.event
    .findUniqueOrThrow({
      where: { id: eventId, guildId },
      select: { id: true },
    })
    .expect({
      P2025: () => data({ code: "NOT_FOUND" }, 404),
    });

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
      if (targetIds.length === 0) throw data(null, 400);

      const [, receipt] = await prisma.$transaction([
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
      Object.assign(receipt, { delete: true });
      return data(receipt, 200);
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
