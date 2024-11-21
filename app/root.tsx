import "./global.css";
import "@pigment-css/react/styles.css";
import Box from "@mui/material-pigment-css/Box";
import Container from "@mui/material-pigment-css/Container";
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@vercel/remix";
import { type PropsWithChildren } from "react";
import { AlertProvider } from "./components/Alert";
import Navigation from "./components/Navigation";
import { useHandle } from "./handle";
import { getSession } from "./lib/session.server";

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

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request, { user: true });
  if (!session) return json(null, 401);
  return json(session.user);
}

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

export default function App() {
  const data = useLoaderData<typeof loader>();
  const { ButtomComponent } = useHandle();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Navigation user={data} />
      <AlertProvider>
        <Container
          sx={{
            flex: "auto",
            overflowX: "hidden",
            overflowY: "scroll",
            paddingTop: 2,
            paddingBottom: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Outlet />
        </Container>
      </AlertProvider>
      {ButtomComponent && <ButtomComponent />}
    </Box>
  );
}
