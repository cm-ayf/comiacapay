import { redirect } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { sidCookie, stateCookie } from "~/lib/cookie.server";
import { OAuth2Error } from "~/lib/error";
import { exchangeCode } from "~/lib/oauth2.server";
import { createSession } from "~/lib/session.server";
import { upsertUserAndMembers } from "~/lib/sync.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const stateFromQuery = url.searchParams.get("state");
    const stateFromCookie = await stateCookie.parse(
      request.headers.get("Cookie"),
    );
    if (!code)
      throw new OAuth2Error("invalid_request", "missing code in query");
    if (!stateFromQuery)
      throw new OAuth2Error("invalid_request", "missing state in query");
    if (!stateFromCookie)
      throw new OAuth2Error("invalid_request", "missing state in cookie");
    if (stateFromQuery !== stateFromCookie)
      throw new OAuth2Error("invalid_request", "state mismatch");

    const tokenResult = await exchangeCode(code);

    const user = await upsertUserAndMembers(tokenResult);
    const session = await createSession(user, tokenResult);

    const setCookie = await sidCookie.serialize(session.sid);
    return redirect(url.searchParams.get("redirect_to") ?? "/", {
      headers: { "Set-Cookie": setCookie },
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirect(error.toRedirectLocation());
  }
}
