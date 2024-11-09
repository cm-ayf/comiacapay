import { redirect, type LoaderFunctionArgs } from "@vercel/remix";
import { sidCookie } from "~/lib/cookie.server";
import { revokeToken } from "~/lib/oauth2.server";
import { deleteSession, getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request);
    await Promise.all([revokeToken(session), deleteSession(session)]);
  } catch {}

  const setCookie = await sidCookie.serialize("", { maxAge: 0 });
  return redirect("/", {
    headers: { "Set-Cookie": setCookie },
  });
}
