import { NextResponse, type NextRequest } from "next/server";
import { upsertMember } from "../sync";
import { decryptTokenSet } from "@/app/(api)/auth/jwt";
import { OAuth2Error } from "@/shared/error";
import { host } from "@/shared/host";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get("guild_id");
    if (!guildId) {
      throw new OAuth2Error("invalid_request", "missing guild_id");
    }
    const tokenSet = request.cookies.get("token_set");
    if (!tokenSet) {
      throw new OAuth2Error("invalid_request", "missing token_set");
    }

    const decryptedTokenSet = await decryptTokenSet(tokenSet.value).catch(
      () => {
        throw new OAuth2Error("access_denied", "invalid token_set");
      },
    );
    await upsertMember(decryptedTokenSet, guildId);

    return NextResponse.redirect(new URL(`/${guildId}`, host));
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return NextResponse.redirect(error.toRedirectURL());
  }
}
