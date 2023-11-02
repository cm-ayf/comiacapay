import "@/styles/globals.css";
import type { PropsWithChildren } from "react";

export const metadata = {
  title: "GraphQL Sandbox",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
