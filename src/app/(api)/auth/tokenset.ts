import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { refreshTokens } from "./oauth2";

export interface TokenSet extends RESTPostOAuth2AccessTokenResult {
  expires_at: number;
}

export async function refreshTokenSet(
  tokenSet: TokenSet,
): Promise<TokenSet | undefined> {
  if (tokenSet.expires_at > Math.floor(Date.now() / 1000)) return;
  const tokenResult = await refreshTokens(tokenSet.refresh_token);
  const expires_at = Math.floor(Date.now() / 1000) + tokenResult.expires_in;
  return { ...tokenResult, expires_at };
}
