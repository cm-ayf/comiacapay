import "./global.css";
import "@pigment-css/react/styles.css";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material-pigment-css/Container";
import type { User } from "@prisma/client";
import {
  isRouteErrorResponse,
  json,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@vercel/remix";
import { Fragment, type PropsWithChildren } from "react";
import { AlertProvider } from "./components/Alert";
import Navigation from "./components/Navigation";
import { useHandleValue, type Handle } from "./lib/handle";
import { useUrlWithRedirectTo } from "./lib/location";
import { getSessionOr401 } from "./lib/middleware.server";
import { prisma } from "./lib/prisma.server";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: MetaFunction = (_) => [];

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId } = await getSessionOr401(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw json(null, 404);

  return json(user);
}

export const handle: Handle<typeof loader> = {
  breadcrumbLabel: () => "Comiacapay",
};

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="emotion-insertion-point" content="" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppLayout({ children, user }: PropsWithChildren<{ user?: User }>) {
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
          <Container
            maxWidth={maxWidth ?? "lg"}
            component="main"
            sx={{
              flex: 1,
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {children}
          </Container>
        </AlertProvider>
        <ButtomComponent />
      </PageContextProvider>
    </>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <AppLayout user={data}>
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const signinUrl = useUrlWithRedirectTo("/auth/signin");

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <AppLayout>
        <Typography>
          <Link to={signinUrl}>サインイン</Link>してください
        </Typography>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Typography>エラーが発生しました</Typography>
      <pre>
        <code>{JSON.stringify(error, null, 2)}</code>
      </pre>
    </AppLayout>
  );
}

export function shouldRevalidate() {
  return false;
}
