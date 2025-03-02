import { redirect, type LoaderFunctionArgs } from "@vercel/remix";
import { revokeToken } from "~/lib/oauth2/auth.server";
import { destroySession, getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  try {
    const tokenResult = session.get("tokenResult");
    if (tokenResult) await revokeToken(tokenResult);
  } catch {}

  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
