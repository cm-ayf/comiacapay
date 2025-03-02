import { useLocation } from "@remix-run/react";
import { useMemo } from "react";

export function useUrlWithRedirectTo(base: string) {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams({ redirect_to: location.pathname });
    return `${base}?${params}`;
  }, [base, location]);
}

export function useLocationType() {
  const location = useLocation();

  return useMemo(() => {
    const parts = location.pathname.split("/");
    if (parts.includes("register")) return "register";
    if (parts.includes("receipts")) return "receipts";
    return "index";
  }, [location.pathname]);
}
