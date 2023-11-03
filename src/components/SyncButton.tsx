import CloudDone from "@mui/icons-material/CloudDone";
import CloudUpload from "@mui/icons-material/CloudUpload";
import LoadingButton, { type LoadingButtonProps } from "@mui/lab/LoadingButton";
import { useCallback, useEffect, useMemo } from "react";
import { useAlert } from "@/app/(web)/Alert";
import { useIDBReceipts } from "@/hooks/idb";
import { useCreateReceipts, useReceipts } from "@/hooks/swr";
import { Receipt } from "@/types/receipt";

interface SyncButtonProps extends LoadingButtonProps {
  eventcode: string;
}

export function SyncButton({ eventcode, ...props }: SyncButtonProps) {
  const { data: onBrowser } = useIDBReceipts(eventcode);
  const { data: onServer } = useReceipts({ eventcode });
  const { trigger: triggerCreate, isMutating: isCreating } = useCreateReceipts({
    eventcode,
  });

  const receipts = useMemo<Receipt[] | undefined>(() => {
    if (!onBrowser || !onServer) return;

    const map = new Map<string, Receipt>(
      onBrowser.map((receipt) => [receipt.id, receipt]),
    );
    for (const { id } of onServer) {
      map.delete(id);
    }

    return Array.from(map.values());
  }, [onBrowser, onServer]);

  const { info, error } = useAlert();

  const sync = useCallback(
    async (receipts: Receipt[] | undefined) => {
      if (!receipts) return;
      try {
        const { count } = await triggerCreate(receipts);
        if (count !== receipts.length) throw new Error();
      } catch (e) {
        error("同期に失敗しました");
      }
    },
    [triggerCreate, error],
  );

  useEffect(() => {
    if (receipts && receipts.length > 10) {
      info("同期されていないデータがあります");
    }
  }, [receipts, info]);

  useEffect(() => {
    const id = setTimeout(sync, 5000, receipts);
    return () => clearTimeout(id);
  }, [receipts, sync]);

  return (
    <LoadingButton
      {...props}
      loading={isCreating}
      startIcon={receipts?.length ? <CloudUpload /> : <CloudDone />}
      disabled={!receipts?.length}
      onClick={() => sync(receipts)}
    >
      同期
    </LoadingButton>
  );
}
