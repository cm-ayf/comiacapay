import "./global.css";
import "@mui/material-pigment-css/styles.css";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material-pigment-css/Container";
import { Prisma, PrismaClient, type User } from "@prisma/client";
import { ManifestLink } from "@remix-pwa/manifest";
import { installPWAGlobals } from "@remix-pwa/sw/install-pwa-globals";
import { Fragment, type PropsWithChildren } from "react";
import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  unstable_createContext,
} from "react-router";
import { UAParser } from "ua-parser-js";
import type { Route } from "./+types/root";
import { AlertProvider } from "./components/Alert";
import Navigation from "./components/Navigation";
import createErrorBoundary from "./components/createErrorBoundary";
import { sidCookie } from "./lib/cookie.server";
import { useHandleValue, useTitle, type Handle } from "./lib/handle";
import {
  createPrismaSessionStorage,
  type SessionData,
} from "./lib/session.server";
import { freshUser } from "./lib/sync/user.server";

export const prismaContext = unstable_createContext<PrismaClient>();
const prismaMiddleware: Route.unstable_MiddlewareFunction = async (
  { context },
  next,
) => {
  context.set(prismaContext, new PrismaClient());
  try {
    return await next();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      error = mapKnownError(error);
    }
    throw error;
  }
};

function mapKnownError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case "P2001": // record does not exist
    case "P2025": // no record found
      return data({ code: "NOT_FOUND", meta: error.meta }, 404);
    case "P2002": // unique constraint failed
    case "P2003": // foreign key constraint failed
    case "P2014": // would violate required relation
      return data({ code: "CONFLICT", meta: error.meta }, 409);
  }

  return error;
}

export const sessionContext = unstable_createContext<SessionData>();
const sessionMiddleware: Route.unstable_MiddlewareFunction = async (
  { request, context },
  next,
) => {
  const url = new URL(request.url);
  if (url.pathname === "/auth/signin" || url.pathname === "/auth/callback")
    return next();

  const prisma = context.get(prismaContext);
  const { getSession, commitSession } = createPrismaSessionStorage(
    prisma,
    sidCookie,
  );

  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const tokenResult = session.get("tokenResult");
  if (!userId || !tokenResult) {
    throw data(
      { code: "UNAUTHORIZED" },
      {
        status: 401,
        headers: {
          "Set-Cookie": await commitSession(session, {
            secure: url.protocol === "https",
          }),
        },
      },
    );
  }

  context.set(sessionContext, { userId, tokenResult });
  return next();
};

export const userContext = unstable_createContext<User>();
const userMiddleware: Route.unstable_MiddlewareFunction = async (
  { context },
  next,
) => {
  const user = await freshUser(context);
  context.set(userContext, user);
  return next();
};

export const unstable_middleware = [
  prismaMiddleware,
  sessionMiddleware,
  userMiddleware,
];

export async function loader({ context }: Route.LoaderArgs) {
  return context.get(userContext);
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
