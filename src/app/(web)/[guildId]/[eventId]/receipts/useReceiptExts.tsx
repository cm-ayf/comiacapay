import { useMemo } from "react";
import { useIDBReceipts } from "@/hooks/idb";
import { useReceipts } from "@/hooks/swr";
import type { Receipt } from "@/types/receipt";

export interface ReceiptExt extends Receipt {
  onServer: boolean;
}

export default function useReceiptExts(eventcode: string) {
  const {
    data: onServer,
    mutate: mutateServer,
    isValidating: isValidatingServer,
  } = useReceipts({ eventcode }, { refreshInterval: 10000 });
  const {
    data: onBrowser,
    mutate: mutateBrowser,
    isValidating: isValidatingBrowser,
  } = useIDBReceipts(eventcode);
  const receipts = useMemo<ReceiptExt[] | undefined>(
    () =>
      onServer &&
      onBrowser &&
      Array.from(
        new Map([
          ...onBrowser.map<[string, ReceiptExt]>((receipt) => [
            receipt.id,
            { ...receipt, onServer: false },
          ]),
          ...onServer.map<[string, ReceiptExt]>((receipt) => [
            receipt.id,
            { ...receipt, onServer: true },
          ]),
        ]).values(),
      ),
    [onServer, onBrowser],
  );
  async function reload() {
    await Promise.all([mutateServer(), mutateBrowser()]);
  }

  return {
    receipts,
    reload,
    isReloading: isValidatingServer || isValidatingBrowser,
  };
}
