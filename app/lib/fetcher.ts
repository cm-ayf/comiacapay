import { useEffect, useEffectEvent, useRef } from "react";
import type { Fetcher } from "react-router";

export function useOnSubmitComplete<TData>(
  fetcher: Fetcher<TData>,
  callback: (data: TData) => void,
) {
  const dataRef = useRef(fetcher.data);
  const callbackEffect = useEffectEvent(callback);

  useEffect(() => {
    if (fetcher.data && fetcher.data !== dataRef.current)
      callbackEffect(fetcher.data);
    dataRef.current = fetcher.data;
  }, [fetcher.data]);
}
