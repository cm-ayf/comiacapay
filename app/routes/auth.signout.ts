import { redirectDocument } from "react-router";
import type { Route } from "./+types/auth.signout";
import { dbContext } from "~/lib/context.server";
import { sidCookie } from "~/lib/cookie.server";
import { revokeToken } from "~/lib/oauth2/auth.server";
import { createDrizzleSessionStorage } from "~/lib/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { getSession, destroySession } = createDrizzleSessionStorage(
    db,
    sidCookie,
  );

  const session = await getSession(request.headers.get("Cookie"));

  try {
    const tokenResult = session.get("tokenResult");
    if (tokenResult) await revokeToken(tokenResult);
  } catch {}

  const url = new URL(request.url);
  return redirectDocument(url.searchParams.get("redirect_to") ?? "/", {
    headers: {
      "Set-Cookie": await destroySession(session, {
        secure: url.protocol === "https",
      }),
    },
  });
}
