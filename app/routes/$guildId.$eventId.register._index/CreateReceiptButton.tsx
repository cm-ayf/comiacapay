import LoadingButton from "@mui/lab/LoadingButton";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback } from "react";
import { useOnSubmitComplete } from "~/lib/fetcher";
import {
  clearRecords,
  getCreateReceiptInput,
  useHasSomeRecord,
} from "~/lib/register";

export function CreateReceiptButton() {
  const { guildId, eventId } = useParams();
  const fetcher = useFetcher();
  const hasSomeRecord = useHasSomeRecord();

  const submit = useCallback(() => {
    const receipt = getCreateReceiptInput();
    fetcher.submit([receipt], {
      method: "POST",
      action: `/${guildId}/${eventId}/receipts`,
      encType: "application/json",
    });
  }, [fetcher, guildId, eventId]);

  useOnSubmitComplete(fetcher, clearRecords);

  return (
    <LoadingButton
      size="large"
      variant="contained"
      loading={fetcher.state !== "idle"}
      disabled={!hasSomeRecord}
      onClick={submit}
    >
      登録
    </LoadingButton>
  );
}
