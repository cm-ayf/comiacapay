import { redirectDocument } from "react-router";
import type { Route } from "./+types/setup.start";
import { OAuth2Error } from "~/lib/oauth2/error";
import { authorizeBotUrl } from "~/lib/oauth2/setup.server";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId) {
    const error = new OAuth2Error("invalid_request");
    return redirectDocument(error.toRedirectLocation());
  }

  const url = new URL(request.url);
  const authorizeUrl = authorizeBotUrl(url.searchParams.get("guild_id"));
  return redirectDocument(authorizeUrl.toString());
}
