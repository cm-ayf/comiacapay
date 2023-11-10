import { base64url } from "jose";
import { NextResponse } from "next/server";
import { env } from "../../env";
import { withCookies } from "../cookie";
import { authorizeUserUrl } from "../oauth2";
import { OAuth2Error } from "@/shared/error";

export async function GET() {
  try {
    const state = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
    const url = authorizeUserUrl(state);
    return withCookies(NextResponse.redirect(url), { state });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return NextResponse.redirect(
      new URL(error.toRedirectURL(), env.NEXT_PUBLIC_HOST),
    );
  }
}
