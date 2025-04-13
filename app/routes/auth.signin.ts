import { base64url } from "jose";
import { redirect } from "react-router";
import type { Route } from "./+types/auth.signin";
import { stateCookie } from "~/lib/cookie.server";
import { authorizeUrl } from "~/lib/oauth2/auth.server";
import { OAuth2Error } from "~/lib/oauth2/error";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { searchParams } = new URL(request.url);
    const h = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
    searchParams.set("h", h);
    const state = searchParams.toString();

    const url = authorizeUrl(state);
    const setCookie = await stateCookie.serialize(state);
    return redirect(url.toString(), {
      headers: { "Set-Cookie": setCookie },
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirect(error.toRedirectLocation());
  }
}
