import "./global.css";
import "@pigment-css/react/styles.css";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material-pigment-css/Container";
import type { User } from "@prisma/client";
import { ManifestLink } from "@remix-pwa/manifest";
import { installPWAGlobals } from "@remix-pwa/sw/install-pwa-globals";
import { Fragment, type PropsWithChildren } from "react";
import type { MetaFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { AlertProvider } from "./components/Alert";
import Navigation from "./components/Navigation";
import createErrorBoundary from "./components/createErrorBoundary";
import { useHandleValue, useTitle, type Handle } from "./lib/handle";
import { getSessionOr401 } from "./lib/middleware.server";
import { prisma } from "./lib/prisma.server";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: MetaFunction = (_) => [];

export async function loader({ request }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);

  return await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
}

export const handle: Handle<typeof loader> = {
  title: "Comiacapay",
  getName: () => "TOP",
};

export function Layout({ children }: PropsWithChildren) {
  installPWAGlobals();
  const title = useTitle();
  return (
    <html lang="ja">
      <head>
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
