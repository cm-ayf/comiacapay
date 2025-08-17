import { redirectDocument } from "react-router";
import type { Route } from "./+types/setup.start";
import { OAuth2Error } from "~/lib/oauth2/error";
import { authorizeBotUrl } from "~/lib/oauth2/setup.server";
import { sessionContext } from "~/root";

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    context.get(sessionContext);
  } catch {
    const error = new OAuth2Error("invalid_request");
    return redirectDocument(error.toRedirectLocation());
  }

  const url = new URL(request.url);
  const authorizeUrl = authorizeBotUrl(url.searchParams.get("guild_id"));
  return redirectDocument(authorizeUrl.toString());
}
