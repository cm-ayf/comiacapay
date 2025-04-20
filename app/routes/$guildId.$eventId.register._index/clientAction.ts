import { safeParse } from "valibot";
import type { Route } from "./+types/route";
import { addReceipt } from "~/lib/idb.client";
import { CreateReceipt } from "~/lib/schema";

export async function clientAction({
  request,
  params,
  serverAction,
}: Route.ClientActionArgs) {
  const body = await request.clone().json();
  const { success, issues, output: receipt } = safeParse(CreateReceipt, body);
  if (!success) throw Response.json(issues, { status: 400 });

  await addReceipt(params.eventId, receipt);
  serverAction().catch(() => {});
  return receipt;
}
