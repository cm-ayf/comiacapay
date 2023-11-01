import { NextRequest, NextResponse } from "next/server";
import { withCookies } from "../cookie";
import { decryptTokenSet } from "../jwt";
import { revokeToken } from "../oauth2";

export async function GET(request: NextRequest) {
  const tokenSet = request.cookies.get("token_set");
  if (tokenSet) {
    try {
      const decryptedTokenSet = await decryptTokenSet(tokenSet.value);
      await revokeToken(decryptedTokenSet.refresh_token);
    } catch {}
  }

  return withCookies(NextResponse.redirect(new URL("/", request.url)), {
    session: "",
    token_set: "",
  });
}
