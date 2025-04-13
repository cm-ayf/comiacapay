import { redirect } from "react-router";
import type { Route } from "./+types/auth.signout";
import { revokeToken } from "~/lib/oauth2/auth.server";
import { destroySession, getSession } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  try {
    const tokenResult = session.get("tokenResult");
    if (tokenResult) await revokeToken(tokenResult);
  } catch {}

  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
