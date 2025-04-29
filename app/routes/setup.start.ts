import { redirectDocument } from "react-router";
import type { Route } from "./+types/setup.start";
import { authorizeBotUrl } from "~/lib/oauth2/setup.server";
import { sessionContext } from "~/root";

export async function loader({ request, context }: Route.LoaderArgs) {
  context.get(sessionContext);

  const url = new URL(request.url);
  const authorizeUrl = authorizeBotUrl(url.searchParams.get("guild_id"));
  return redirectDocument(authorizeUrl.toString());
}
