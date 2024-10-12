import { redirect, type LoaderFunctionArgs } from "@vercel/remix";
import { getCookies, setCookies } from "~/lib/cookie.server";
import { OAuth2Error } from "~/lib/error";
import { host } from "~/lib/host";
import { encryptTokenSet, signSession } from "~/lib/jwt.server";
import { exchangeCode } from "~/lib/oauth2.server";
import { upsertUserAndMembers } from "~/lib/sync.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookies = await getCookies(request.headers);
    if (!code)
      throw new OAuth2Error("invalid_request", "missing code in query");
    if (!state)
      throw new OAuth2Error("invalid_request", "missing state in query");
    if (!cookies.state)
      throw new OAuth2Error("invalid_request", "missing state in cookie");
    if (state !== cookies.state)
      throw new OAuth2Error("invalid_request", "state mismatch");

    const tokenResult = await exchangeCode(code);
    const token_set = await encryptTokenSet(tokenResult);

    const user = await upsertUserAndMembers(tokenResult);
    const session = await signSession(user.id);

    const redirectUrl = new URL(cookies.redirect_to ?? "/", host);
    const headers = await setCookies({
      session,
      token_set,
      state: "",
      redirect_to: "",
    });
    return redirect(redirectUrl.toString(), { headers });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    const headers = await setCookies(
      error.error === "server_error" ? {} : { state: "", redirect_to: "" },
    );
    return redirect(error.toRedirectURL().toString(), { headers });
  }
}
