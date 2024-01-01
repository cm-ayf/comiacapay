import "server-only";

import { OAuth2Routes, OAuth2Scopes } from "discord-api-types/v10";
import type {
  RESTOAuth2AdvancedBotAuthorizationQuery,
  RESTPostOAuth2AccessTokenURLEncodedData,
  RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
} from "discord-api-types/v10";
import type { NextRequest } from "next/server";
import { verifySession } from "@/app/(api)/auth/jwt";
import { authorizeUrl, oauth2Post } from "@/app/(api)/auth/oauth2";
import { env } from "@/app/(api)/env";
import { OAuth2Error } from "@/shared/error";
import { host } from "@/shared/host";

const client_id = env.DISCORD_CLIENT_ID;
const client_secret = env.DISCORD_CLIENT_SECRET;
const redirect_uri = new URL("/guilds/callback", host).toString();

export function authorizeBotUrl(guild_id?: string | null) {
  return authorizeUrl({
    client_id,
    redirect_uri,
    response_type: "code",
    scope: `${OAuth2Scopes.Bot} ${OAuth2Scopes.Guilds} ${OAuth2Scopes.GuildsMembersRead}`,
    ...(guild_id ? { guild_id, disable_guild_select: true } : {}),
  } satisfies RESTOAuth2AdvancedBotAuthorizationQuery);
}

export async function exchangeCode(
  code: string,
): Promise<RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult> {
  return oauth2Post(OAuth2Routes.tokenURL, {
    client_id,
    client_secret,
    grant_type: "authorization_code",
    code,
    redirect_uri,
  } satisfies RESTPostOAuth2AccessTokenURLEncodedData).catch((e) => {
    throw OAuth2Error.fromError(e, {
      error: "access_denied",
      error_description: "Failed to exchange code",
    });
  });
}

export async function retrieveSession(request: NextRequest) {
  const session = request.cookies.get("session");
  if (!session) {
    throw new OAuth2Error("invalid_request", "missing session");
  }

  return await verifySession(session.value).catch(() => {
    throw new OAuth2Error("access_denied", "invalid session");
  });
}
