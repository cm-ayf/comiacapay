import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import {
  getMemberOr4xx,
  getSessionOr401,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { EventParams } from "~/lib/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = parseParamsOr400(EventParams, params);
  await getMemberOr4xx(userId, guildId, "read");

  const receipts = await prisma.receipt.findMany({
    where: { eventId },
    include: { records: true },
  });

  return json(receipts);
}

export function useReceipts() {
  return useLoaderData<typeof loader>();
}
