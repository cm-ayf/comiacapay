import type { Fetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";

export function useOnSubmitComplete<TData>(
  fetcher: Fetcher<TData>,
  callback: (data: TData | undefined) => void,
) {
  const isSubmitting = fetcher.state === "submitting";
  const isSubmittingRef = useRef(isSubmitting);

  // avoid firing useEffect by callback change
  const callbackRef = useRef(() => {});
  callbackRef.current = () => callback(fetcher.data);

  useEffect(() => {
    if (!isSubmitting && isSubmittingRef.current) callbackRef.current();
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);
}
