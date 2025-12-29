import Button from "@mui/material/Button";
import { useCallback } from "react";
import { useFetcher, useParams } from "react-router";
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
    fetcher.submit(receipt, {
      method: "POST",
      // this button is rendered outside of the route context
      action: `/${guildId}/${eventId}/register`,
    });
  }, [fetcher, guildId, eventId]);

  useOnSubmitComplete(fetcher, clearRecords);

  return (
    <Button
      size="large"
      variant="contained"
      loading={fetcher.state !== "idle"}
      disabled={!hasSomeRecord}
      onClick={submit}
    >
      登録
    </Button>
  );
}
