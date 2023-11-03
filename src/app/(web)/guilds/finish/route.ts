import { NextResponse, type NextRequest } from "next/server";
import { upsertMember } from "../sync";
import { decryptTokenSet } from "@/app/(api)/auth/jwt";
import { env } from "@/app/(api)/env";
import { OAuth2Error } from "@/shared/error";

export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get("guild_id");
    if (!guildId) {
      throw new OAuth2Error("invalid_request", "missing guild_id");
    }
    const tokenSet = request.nextUrl.searchParams.get("token_set");
    if (!tokenSet) {
      throw new OAuth2Error("invalid_request", "missing token_set");
    }

    const decryptedTokenSet = await decryptTokenSet(tokenSet);
    await upsertMember(decryptedTokenSet, guildId);

    return NextResponse.redirect(new URL(`/${guildId}`, env.HOST));
  } catch (e) {
    const error = OAuth2Error.fromError(e, "Failed to initiate");
    return NextResponse.redirect(new URL(error.toRedirectURL(), env.HOST));
  }
}
