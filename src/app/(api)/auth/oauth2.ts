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
import { env } from "@/app/(api)/env";
import { OAuth2Error } from "@/shared/error";

const client_id = env.DISCORD_CLIENT_ID;
const client_secret = env.DISCORD_CLIENT_SECRET;
const basic = btoa(`${client_id}:${client_secret}`);
const redirect_uri = new URL("/auth/callback", env.NEXT_PUBLIC_HOST).toString();

export function authorizeUrl(params: Record<string, string | boolean>) {
  const url = new URL(OAuth2Routes.authorizationURL);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, String(value));
  }
  return url;
}

export function authorizeUserUrl(state: string) {
  return authorizeUrl({
    client_id,
    redirect_uri,
    response_type: "code",
    scope: `${OAuth2Scopes.Identify} ${OAuth2Scopes.Guilds} ${OAuth2Scopes.GuildsMembersRead}`,
    state,
  } satisfies RESTOAuth2AuthorizationQuery);
}

export async function oauth2Post(route: string, body: Record<string, string>) {
  const response = await fetch(route, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
    cache: "no-cache",
  });

  if (response.status === 400) {
    throw new OAuth2Error("invalid_credentials", "Invalid grant");
  } else if (!response.ok) {
    throw new Error();
  }

  return await response.json();
}

export async function exchangeCode(
  code: string,
): Promise<RESTPostOAuth2AccessTokenResult> {
  return oauth2Post(OAuth2Routes.tokenURL, {
    client_id,
    client_secret,
    grant_type: "authorization_code",
    code,
    redirect_uri,
  } satisfies RESTPostOAuth2AccessTokenURLEncodedData).catch((e) => {
    throw OAuth2Error.fromError(e, "Failed to exchange code");
  });
}

export async function refreshTokens(
  refresh_token: string,
): Promise<RESTPostOAuth2RefreshTokenResult> {
  return oauth2Post(OAuth2Routes.tokenURL, {
    client_id,
    client_secret,
    grant_type: "refresh_token",
    refresh_token,
  } satisfies RESTPostOAuth2RefreshTokenURLEncodedData).catch((e) => {
    throw OAuth2Error.fromError(e, "Failed to refresh tokens");
  });
}

export async function revokeToken(token: string) {
  return oauth2Post(OAuth2Routes.tokenRevocationURL, { token }).catch((e) => {
    throw OAuth2Error.fromError(e, "Failed to revoke token");
  });
}

async function oauth2Get<T>(route: string, accessToken: string): Promise<T> {
  const response = await fetch(RouteBases.api + route, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-cache",
  });

  if (response.status === 401) {
    throw new OAuth2Error("invalid_credentials", "Invalid token");
  } else if (!response.ok) {
    throw new Error();
  }

  return await response.json();
}

export async function getCurrentUser(accessToken: string) {
  return oauth2Get<APIUser>(Routes.user(), accessToken).catch((e) => {
    throw OAuth2Error.fromError(e, "Failed to get current user");
  });
}

export async function getCurrentUserGuilds(accessToken: string) {
  return oauth2Get<APIGuild[]>(Routes.userGuilds(), accessToken).catch((e) => {
    throw OAuth2Error.fromError(e, "Failed to get current user guilds");
  });
}

export async function getCurrentUserGuildMember(
  accessToken: string,
  guildId: string,
) {
  return oauth2Get<APIGuildMember>(
    Routes.userGuildMember(guildId),
    accessToken,
  ).catch((e) => {
    throw OAuth2Error.fromError(e, "Failed to get current user guild member");
  });
}
