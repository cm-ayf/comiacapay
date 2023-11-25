import { NextRequest, NextResponse } from "next/server";
import { withCookies, type Cookies } from "../cookie";
import { decryptTokenSet, encryptTokenSet, signSession } from "../jwt";
import { upsertUserAndMembers } from "../sync";
import { refreshTokenSet } from "../tokenset";
import { OAuth2Error } from "@/shared/error";
import { host } from "@/shared/host";

export { handler as GET, handler as POST };
async function handler(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  const tokenSet = request.cookies.get("token_set");
  if (!tokenSet) {
    const error = new OAuth2Error("invalid_request", "missing token_set");
    return NextResponse.json(error, { status: error.status });
  }

  try {
    const decryptedTokenSet = await decryptTokenSet(tokenSet.value).catch(
      () => {
        throw new OAuth2Error("invalid_credentials", "invalid token_set");
      },
    );
    const refreshedTokenSet = await refreshTokenSet(decryptedTokenSet);
    const user = await upsertUserAndMembers(
      refreshedTokenSet ?? decryptedTokenSet,
    );

    const cookies: Cookies = {};
    cookies.session = await signSession(user.id);
    if (refreshedTokenSet) {
      cookies.token_set = await encryptTokenSet(refreshedTokenSet);
    }

    switch (request.method) {
      case "GET":
        const redirectTo = request.nextUrl.searchParams.get("redirect_to");
        return withCookies(
          NextResponse.redirect(new URL(redirectTo ?? "/", host)),
          cookies,
        );
      case "POST":
        return withCookies(NextResponse.json(user, { status: 200 }), cookies);
    }
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    const cookies: Cookies =
      error.code === "server_error"
        ? {}
        : { state: "", session: "", token_set: "" };
    switch (request.method) {
      case "GET":
        return withCookies(
          NextResponse.redirect(error.toRedirectURL()),
          cookies,
        );
      case "POST":
        return withCookies(
          NextResponse.json(error, { status: error.status }),
          cookies,
        );
    }
  }
}
