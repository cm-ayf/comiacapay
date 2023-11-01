import { NextRequest, NextResponse } from "next/server";
import { withCookies, type Cookies } from "../cookie";
import { decryptTokenSet, encryptTokenSet, signSession } from "../jwt";
import { upsertUserAndMembers } from "../sync";
import { refreshTokenSet } from "../tokenset";
import { OAuth2Error } from "@/shared/error";

export async function POST(request: NextRequest) {
  const tokenSet = request.cookies.get("token_set");
  if (!tokenSet) {
    const error = new OAuth2Error("invalid_request", "missing token_set");
    return NextResponse.json(error, { status: error.status });
  }

  try {
    const decryptedTokenSet = await decryptTokenSet(tokenSet.value);
    const refreshedTokenSet = await refreshTokenSet(decryptedTokenSet);
    const user = await upsertUserAndMembers(
      refreshedTokenSet ?? decryptedTokenSet,
    );

    const cookies: Cookies = {};
    cookies.session = await signSession(user.id);
    if (refreshedTokenSet) {
      cookies.token_set = await encryptTokenSet(refreshedTokenSet);
    }

    return withCookies(new NextResponse(null, { status: 204 }), cookies);
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return withCookies(
      NextResponse.json(error, { status: error.status }),
      error.code === "server_error"
        ? {}
        : { state: "", session: "", token_set: "" },
    );
  }
}
