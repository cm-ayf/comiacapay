import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Prisma } from "@prisma/client";
import { json, type ActionFunctionArgs } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import {
  CreateReceipts,
  EventParams,
  type CreateReceiptsOutput,
} from "~/lib/schema";

const resolver = valibotResolver(CreateReceipts);

export async function action({ request, params }: ActionFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = parseParamsOr400(EventParams, params);
  await getMemberOr4xx(userId, guildId, "register");

  if (request.method !== "POST") throw json(null, 405);

  const data = await getValidatedBodyOr400<CreateReceiptsOutput>(
    request,
    resolver,
  );

  await prisma.$transaction([
    prisma.receipt.createMany({
      data: data.map(({ id, total }) => ({ id, eventId, userId, total })),
    }),
    prisma.record.createMany({
      data: Array.from(records(eventId, data)),
    }),
  ]);

  return json({ __neverRevalidate: true }, 201);
}

function* records(
  eventId: string,
  data: CreateReceiptsOutput,
): Generator<Prisma.RecordCreateManyInput> {
  for (const receipt of data) {
    for (const record of receipt.records) {
      yield { receiptId: receipt.id, eventId, ...record };
    }
  }
}
