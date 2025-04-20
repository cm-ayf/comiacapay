import type { Route } from "./+types/route";
import { setReceiptsDeleted } from "~/lib/idb.client";

export async function clientAction({
  request,
  serverAction,
}: Route.ClientActionArgs) {
  const url = new URL(request.url);
  const response = await serverAction();
  if (request.method === "DELETE")
    await setReceiptsDeleted(url.searchParams.getAll("id")).catch(() => {});
  return response;
}
