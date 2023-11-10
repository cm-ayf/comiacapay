import { NextRequest, NextResponse } from "next/server";
import { env } from "../../env";
import { withCookies } from "../cookie";
import { encryptTokenSet, signSession } from "../jwt";
import { exchangeCode } from "../oauth2";
import { upsertUserAndMembers } from "../sync";
import { OAuth2Error } from "@/shared/error";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const stateFromQuery = request.nextUrl.searchParams.get("state");
    const stateFromCookie = request.cookies.get("state");
    if (!code || !stateFromQuery || !stateFromCookie) {
      throw new OAuth2Error("invalid_request", "missing code or state");
    }
    if (stateFromQuery !== stateFromCookie.value) {
      throw new OAuth2Error("invalid_credentials", "state mismatch");
    }

    const tokenResult = await exchangeCode(code);
    const expires_at = Math.floor(Date.now() / 1000) + tokenResult.expires_in;
    const token_set = await encryptTokenSet({
      ...tokenResult,
      expires_at,
    });

    const user = await upsertUserAndMembers(tokenResult);
    const session = await signSession(user.id);

    return withCookies(NextResponse.redirect(new URL("/", request.url)), {
      session,
      token_set,
      state: "",
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return withCookies(
      NextResponse.redirect(
        new URL(error.toRedirectURL(), env.NEXT_PUBLIC_HOST),
      ),
      error.code === "server_error" ? {} : { state: "" },
    );
  }
}