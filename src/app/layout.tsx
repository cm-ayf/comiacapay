import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { AlertProvider } from "@/hooks/Alert";
import { UserStateProvider } from "@/hooks/UserState";
import "@/styles/globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  themeColor: "#1976d2",
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
        <AlertProvider>
          <UserStateProvider>{children}</UserStateProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
