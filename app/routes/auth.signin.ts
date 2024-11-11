import { redirect } from "@vercel/remix";
import { base64url } from "jose";
import { stateCookie } from "~/lib/cookie.server";
import { OAuth2Error } from "~/lib/error";
import { authorizeUrl } from "~/lib/oauth2.server";

export async function loader() {
  try {
    const state = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
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
