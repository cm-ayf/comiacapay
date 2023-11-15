import { base64url } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { withCookies } from "../cookie";
import { authorizeUserUrl } from "../oauth2";
import { OAuth2Error } from "@/shared/error";

export async function GET(request: NextRequest) {
  try {
    const redirect_to = request.nextUrl.searchParams.get("redirect_to") ?? "/";
    const state = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
    const url = authorizeUserUrl(state);
    return withCookies(NextResponse.redirect(url), { state, redirect_to });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return NextResponse.redirect(error.toRedirectURL());
  }
}
