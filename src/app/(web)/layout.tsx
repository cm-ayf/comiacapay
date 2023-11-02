import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { AlertProvider } from "./Alert";
import { ApolloProvider } from "./Apollo";
import { UserStateProvider } from "./UserState";
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
        <AlertProvider>
          <ApolloProvider>
            <UserStateProvider>{children}</UserStateProvider>
          </ApolloProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
