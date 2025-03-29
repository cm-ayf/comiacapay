import LoadingButton from "@mui/lab/LoadingButton";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useEffect, useRef } from "react";
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

  useOnAfter(fetcher.state, "submitting", clearRecords);

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

function useOnAfter<T>(state: T, target: NoInfer<T>, callback: () => void) {
  const previousState = useRef(state);
  const targetRef = useRef(target);
  const callbackRef = useRef(callback);

  useEffect(() => {
    if (
      previousState.current === targetRef.current &&
      state !== targetRef.current
    ) {
      callbackRef.current();
    }

    previousState.current = state;
    // assume target and callback are immutable
  }, [state]);
}
