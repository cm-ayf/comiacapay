import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { AlertProvider } from "@/hooks/Alert";
import { UserStateProvider } from "@/hooks/UserState";
import "@/styles/globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon-180x180.png",
  },
  title: "Comiacapay",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <body>
        <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}
