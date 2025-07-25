import "./global.css";
import "@mui/material-pigment-css/styles.css";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material-pigment-css/Container";
import type { User } from "@prisma/client";
import { Fragment, useRef, type PropsWithChildren } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { pwaInfo } from "virtual:pwa-info";
import { useRegisterSW } from "virtual:pwa-register/react";
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

class Prefetcher {
  #head?: HTMLHeadElement | null;
  #registration?: ServiceWorkerRegistration | undefined;

  headRef(head: HTMLHeadElement | null) {
    this.#head = head;
    this.prefetch();
  }

  onRegisteredSW(registration: ServiceWorkerRegistration | undefined) {
    this.#registration = registration;
    this.prefetch();
  }

  prefetch() {
    if (!this.#head || !this.#registration) return;

    this.#head
      .querySelectorAll<HTMLLinkElement>(`link[rel=prefetch]`)
      .forEach((link) => {
        fetch(link.href, {
          priority: "low",
          cache: "force-cache",
        }).catch(() => {});
      });
  }
}

export function Layout({ children }: PropsWithChildren) {
  const title = useTitle();
  const prefetcherRef = useRef(new Prefetcher());
  useRegisterSW({
    onRegisteredSW(_, registration) {
      prefetcherRef.current.onRegisteredSW(registration);
    },
  });
  return (
    <html lang="ja">
      <head ref={(head) => prefetcherRef.current.headRef(head)}>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="manifest" href={pwaInfo?.webManifest.href} />
        {/* TODO: add icons
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <link rel="mask-icon" href="/mask-icon.svg" color="#FFFFFF" /> 
        */}
        <meta name="emotion-insertion-point" content="" />
        <Meta />
        <Links />
        <title>{title ?? "Comiacapay"}</title>
        <meta name="description" content="同人即売会用のレジアプリ" />
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
  const ButtomComponent = useHandleValue("ButtomComponent", Fragment);
  const maxWidth = useHandleValue("containerMaxWidth", "lg");

  return (
    <>
      <Navigation user={user} />
      <Toolbar variant="dense" />
      <AlertProvider>
        <Container maxWidth={maxWidth ?? "lg"} component="main">
          {children}
        </Container>
      </AlertProvider>
      <ButtomComponent />
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
