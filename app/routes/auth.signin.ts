import { redirectDocument } from "react-router";
import { stateCookie } from "~/lib/cookie.server";
import { authorizeUrl } from "~/lib/oauth2/auth.server";
import { OAuth2Error } from "~/lib/oauth2/error";
import type { Route } from "./+types/auth.signin";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const stateUrl = new URL(request.url);
    const h = crypto.getRandomValues(Buffer.alloc(32)).toString("base64url");
    stateUrl.searchParams.set("h", h);
    const state = stateUrl.toString();

    const url = authorizeUrl(state);
    const setCookie = await stateCookie.serialize(state, {
      secure: request.url.startsWith("https://"),
    });
    return redirectDocument(url.toString(), {
      headers: { "Set-Cookie": setCookie },
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirectDocument(error.toRedirectLocation());
  }
}
