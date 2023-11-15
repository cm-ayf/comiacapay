import { NextResponse, type NextRequest } from "next/server";
import { authorizeBotUrl, retrieveSession } from "../oauth2";
import { OAuth2Error } from "@/shared/error";

export async function GET(request: NextRequest) {
  try {
    await retrieveSession(request);
    const url = authorizeBotUrl(request.nextUrl.searchParams.get("guild_id"));
    return NextResponse.redirect(url);
  } catch (e) {
    const error = OAuth2Error.fromError(e, "Failed to initiate");
    return NextResponse.redirect(error.toRedirectURL());
  }
}
