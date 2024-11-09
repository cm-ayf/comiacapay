import { redirect } from "@vercel/remix";
import { base64url } from "jose";
import { stateCookie } from "~/lib/cookie.server";
import { OAuth2Error } from "~/lib/error";
import { authorizeUserUrl } from "~/lib/oauth2.server";

export async function loader() {
  try {
    const state = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
    const authorizeUrl = authorizeUserUrl(state);
    const setCookie = await stateCookie.serialize(state);
    return redirect(authorizeUrl.toString(), {
      headers: { "Set-Cookie": setCookie },
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirect(error.toRedirectURL().toString());
  }
}
