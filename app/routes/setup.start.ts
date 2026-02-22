import { redirectDocument } from "react-router";
import { sessionContext } from "~/lib/context.server";
import { OAuth2Error } from "~/lib/oauth2/error";
import { authorizeBotUrl } from "~/lib/oauth2/setup.server";
import type { Route } from "./+types/setup.start";

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    await context.get(sessionContext);
  } catch {
    const error = new OAuth2Error("invalid_request");
    return redirectDocument(error.toRedirectLocation());
  }

  const url = new URL(request.url);
  const authorizeUrl = authorizeBotUrl(url.searchParams.get("guild_id"));
  return redirectDocument(authorizeUrl.toString());
}
