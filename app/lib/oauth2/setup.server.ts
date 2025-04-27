import { OAuth2Routes, OAuth2Scopes } from "discord-api-types/v10";
import type {
  RESTOAuth2AdvancedBotAuthorizationQuery,
  RESTPostOAuth2AccessTokenURLEncodedData,
  RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
} from "discord-api-types/v10";
import { env } from "../env.server";
import { OAuth2Error } from "./error";
import { oauth2Post, oauth2Url } from "./shared.server";

const redirect_uri = new URL(
  "/setup/callback",
  env.DISCORD_OAUTH2_ORIGIN,
).toString();

export function authorizeBotUrl(guild_id?: string | null) {
  return oauth2Url(OAuth2Routes.authorizationURL, {
    client_id: env.DISCORD_CLIENT_ID,
    redirect_uri,
    response_type: "code",
    scope: `${OAuth2Scopes.Bot} ${OAuth2Scopes.Guilds} ${OAuth2Scopes.GuildsMembersRead}`,
    ...(guild_id ? { guild_id, disable_guild_select: true } : {}),
  } satisfies RESTOAuth2AdvancedBotAuthorizationQuery);
}

export async function exchangeBotCode(
  code: string,
): Promise<RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult> {
  return oauth2Post(OAuth2Routes.tokenURL, {
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
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
