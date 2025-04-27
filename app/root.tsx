import "./global.css";
import "@mui/material-pigment-css/styles.css";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material-pigment-css/Container";
import type { User } from "@prisma/client";
import { ManifestLink } from "@remix-pwa/manifest";
import { installPWAGlobals } from "@remix-pwa/sw/install-pwa-globals";
import { Fragment, type PropsWithChildren } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { UAParser } from "ua-parser-js";
import type { Route } from "./+types/root";
import { AlertProvider } from "./components/Alert";
import Navigation from "./components/Navigation";
import createErrorBoundary from "./components/createErrorBoundary";
import { useHandleValue, useTitle, type Handle } from "./lib/handle";
import { getSessionOr401 } from "./lib/middleware.server";
import { freshUser } from "./lib/sync/user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionOr401(request);
  return await freshUser(session);
}

export const handle: Handle<typeof loader> = {
  title: "Comiacapay",
  getName: () => "TOP",
};

const prefetchedLinks = new Set<string>();
function handlePrefetchLinksOnSafari(head: HTMLHeadElement) {
  const parser = new UAParser();
  if (!parser.getBrowser().is("safari")) return;

  const links = head.querySelectorAll<HTMLLinkElement>(`link[rel=prefetch]`);
  for (const link of links) {
    if (prefetchedLinks.has(link.href)) continue;
    prefetchedLinks.add(link.href);
    fetch(link.href, { priority: "low" }).catch(() => {});
  }
}

export function Layout({ children }: PropsWithChildren) {
  installPWAGlobals();
  const title = useTitle();
  return (
    <html lang="ja">
      <head
        ref={(head) => {
          if (head) handlePrefetchLinksOnSafari(head);
        }}
      >
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="emotion-insertion-point" content="" />
        <ManifestLink href="/manifest.webmanifest" />
        <Meta />
        <Links />
        <title>{title}</title>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppLayout({
  children,
  user,
}: PropsWithChildren<{ user: User | undefined }>) {
  installPWAGlobals();
  const PageContextProvider = useHandleValue("PageContextProvider", Fragment);
  const TopComponent = useHandleValue("TopComponent", Fragment);
  const ButtomComponent = useHandleValue("ButtomComponent", Fragment);
  const maxWidth = useHandleValue("containerMaxWidth", "lg");

  return (
    <>
      <Navigation user={user} />
      <Toolbar variant="dense" />
      <PageContextProvider>
        <TopComponent />
        <AlertProvider>
          <Container maxWidth={maxWidth ?? "lg"} component="main">
            {children}
          </Container>
        </AlertProvider>
        <ButtomComponent />
      </PageContextProvider>
    </>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout user={loaderData}>
      <Outlet />
    </AppLayout>
  );
}

const ErrorBoundaryInner = createErrorBoundary();
export function ErrorBoundary({ error, loaderData }: Route.ErrorBoundaryProps) {
  return (
    <AppLayout user={loaderData}>
      <ErrorBoundaryInner error={error} />
    </AppLayout>
  );
}

export function shouldRevalidate() {
  return false;
}
