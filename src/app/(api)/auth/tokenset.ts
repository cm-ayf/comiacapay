import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { JWTPayload } from "jose";
import { refreshTokens } from "./oauth2";

export interface TokenSet
  extends Required<JWTPayload>,
    RESTPostOAuth2AccessTokenResult {}

export type AccessTokenSet = Pick<TokenSet, "access_token" | "token_type">;
export type RefreshTokenSet = Pick<TokenSet, "refresh_token" | "exp">;

export async function refreshTokenSet(tokenSet: RefreshTokenSet) {
  if (tokenSet.exp * 1000 - Date.now() > 6 * 24 * 60 * 60 * 1000) return;
  return await refreshTokens(tokenSet);
}
