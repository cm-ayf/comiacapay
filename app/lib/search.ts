import { useSearchParams } from "@remix-run/react";
import { useCallback } from "react";

export function useSearchParamsState(key: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key);
  const setValue = useCallback(
    (newValue: string | null | ((prev: string | null) => string | null)) => {
      setSearchParams(
        (prev) => {
          if (typeof newValue === "function") {
            newValue = newValue(prev.get(key));
          }
          if (newValue === null) prev.delete(key);
          else prev.set(key, newValue);
          return prev;
        },
        { replace: true },
      );
    },
    [key, setSearchParams],
  );
  return [value, setValue] as const;
}
