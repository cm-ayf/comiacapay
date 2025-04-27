import type { Route } from "./+types/route";
import {
  getReceipts,
  setReceiptsPushed,
  type IDBReceipt,
} from "~/lib/idb.client";
import type { ClientReceipt } from "~/lib/schema";

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const [{ receipts: server }, client] = await Promise.all([
    serverLoader(),
    getReceipts(params.eventId),
  ]);

  const indexReceiptsById = new Map<string, IDBReceipt>();
  const receiptsAlreadyPushed: ClientReceipt[] = [];
  const receiptsToBePushed: IDBReceipt[] = [];

  let serverIndex = 0;
  let clientIndex = 0;
  while (serverIndex < server.length || clientIndex < client.length) {
    const serverCurrent = server[serverIndex];
    const clientCurrent = client[clientIndex];

    if (
      serverCurrent &&
      clientCurrent &&
      serverCurrent.id === clientCurrent.id
    ) {
      indexReceiptsById.set(serverCurrent.id, {
        ...serverCurrent,
        pushed: true,
      });
      if (!clientCurrent.pushed) receiptsAlreadyPushed.push(serverCurrent);
      serverIndex++;
      clientIndex++;
    }
    if (serverCurrent && gt(serverCurrent, clientCurrent)) {
      indexReceiptsById.set(serverCurrent.id, {
        ...serverCurrent,
        pushed: true,
      });
      receiptsAlreadyPushed.push(serverCurrent);
      serverIndex++;
    }
    if (clientCurrent && gt(clientCurrent, serverCurrent)) {
      indexReceiptsById.set(clientCurrent.id, clientCurrent);
      receiptsToBePushed.push(clientCurrent);
      clientIndex++;
    }
  }

  setReceiptsPushed(receiptsAlreadyPushed).catch(() => {});

  return {
    receipts: Array.from(indexReceiptsById.values()),
    receiptsToBePushed,
  };
}
clientLoader.hydrate = true as const;

function gt(a: { id: string }, b: { id: string } | undefined) {
  if (!b) return true;
  return BigInt(a.id) > BigInt(b.id);
}
