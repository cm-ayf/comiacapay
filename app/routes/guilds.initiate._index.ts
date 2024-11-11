import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { OAuth2Error } from "~/lib/error";
import { authorizeBotUrl } from "~/lib/oauth2guilds.server";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request).catch(() => null);
  if (!session)
    return redirect(new OAuth2Error("invalid_request").toRedirectLocation());

  const url = new URL(request.url);
  const authorizeUrl = authorizeBotUrl(url.searchParams.get("guild_id"));
  return redirect(authorizeUrl.toString());
}
