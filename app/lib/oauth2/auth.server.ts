import {
  OAuth2Routes,
  OAuth2Scopes,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import type {
  APIGuild,
  APIGuildMember,
  APIUser,
  RESTOAuth2AuthorizationQuery,
  RESTPostOAuth2AccessTokenResult,
  RESTPostOAuth2AccessTokenURLEncodedData,
  RESTPostOAuth2RefreshTokenResult,
  RESTPostOAuth2RefreshTokenURLEncodedData,
} from "discord-api-types/v10";
import { data } from "react-router";
import { env } from "../env.server";
import { OAuth2Error } from "./error";
import { oauth2Post, oauth2Url } from "./shared.server";

const redirect_uri = new URL(
  "/auth/callback",
  env.DISCORD_OAUTH2_ORIGIN,
).toString();

export function authorizeUrl(state: string) {
  return oauth2Url(OAuth2Routes.authorizationURL, {
    client_id: env.DISCORD_CLIENT_ID,
    redirect_uri,
    response_type: "code",
    prompt: "none",
    scope: `${OAuth2Scopes.Identify} ${OAuth2Scopes.Guilds} ${OAuth2Scopes.GuildsMembersRead}`,
    state,
  } satisfies RESTOAuth2AuthorizationQuery);
}

export async function exchangeCode(
  code: string,
): Promise<RESTPostOAuth2AccessTokenResult> {
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

export async function refreshTokens({
  refresh_token,
}: RESTPostOAuth2AccessTokenResult): Promise<RESTPostOAuth2RefreshTokenResult> {
  return oauth2Post(OAuth2Routes.tokenURL, {
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  } satisfies RESTPostOAuth2RefreshTokenURLEncodedData).catch((e) => {
    throw OAuth2Error.fromError(e, {
      error: "access_denied",
      error_description: "Failed to refresh token",
    });
  });
}

export async function revokeToken({
  access_token,
}: RESTPostOAuth2AccessTokenResult) {
  return oauth2Post(OAuth2Routes.tokenRevocationURL, {
    token: access_token,
  }).catch((e) => {
    throw OAuth2Error.fromError(e, {
      error: "server_error",
      error_description: "Failed to revoke token",
    });
  });
}

async function oauth2Get<T>(
  route: string,
  tokenSet: RESTPostOAuth2AccessTokenResult,
): Promise<T> {
  const response = await fetch(RouteBases.api + route, {
    headers: {
      Authorization: `${tokenSet.token_type} ${tokenSet.access_token}`,
    },
    cache: "no-cache",
  });

  if (response.status === 429) {
    throw data({ retryAfter: response.headers.get("Retry-After") }, 429);
  }
  if (response.status === 401) {
    throw new OAuth2Error("access_denied");
  } else if (!response.ok) {
    throw new Error();
  }

  return await response.json();
}

export async function getCurrentUser(
  tokenSet: RESTPostOAuth2AccessTokenResult,
) {
  return oauth2Get<APIUser>(Routes.user(), tokenSet);
}

export async function getCurrentUserGuilds(
  tokenSet: RESTPostOAuth2AccessTokenResult,
) {
  return oauth2Get<APIGuild[]>(Routes.userGuilds(), tokenSet);
}

export async function getCurrentUserGuildMember(
  tokenSet: RESTPostOAuth2AccessTokenResult,
  guildId: string,
) {
  return oauth2Get<APIGuildMember>(Routes.userGuildMember(guildId), tokenSet);
}
