import type { WebAppManifest } from "@remix-pwa/manifest";
import { data } from "react-router";
import type { Route } from "./+types/manifest[.webmanifest]";

export function loader({}: Route.LoaderArgs) {
  return data(
    {
      lang: "ja",
      theme_color: "#1976d2",
      background_color: "#1976d2",
      display: "standalone",
      scope: "/",
      start_url: "/",
      name: "Comiacapay",
      short_name: "comiacapay",
      description: "同人即売会用のレジアプリ",
      icons: [],
    } satisfies WebAppManifest,
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
}
