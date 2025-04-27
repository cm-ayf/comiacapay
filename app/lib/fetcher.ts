import { useEffect, useRef } from "react";
import type { Fetcher } from "react-router";

export function useOnSubmitComplete<TData>(
  fetcher: Fetcher<TData>,
  callback: (data: TData) => void,
) {
  const dataRef = useRef(fetcher.data);

  // avoid firing useEffect by callback change
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (fetcher.data && fetcher.data !== dataRef.current)
      callbackRef.current(fetcher.data);
    dataRef.current = fetcher.data;
  }, [fetcher.data]);
}
