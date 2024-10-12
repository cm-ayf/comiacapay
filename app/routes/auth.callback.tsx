import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@vercel/remix";
import { useEffect } from "react";
import { getCookies, setCookies } from "~/lib/cookie.server";
import { OAuth2Error } from "~/lib/error";
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

    const headers = await setCookies({
      session,
      token_set,
      state: "",
    });
    return json({}, { headers });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    const headers = await setCookies(
      error.error === "server_error" ? {} : { state: "" },
    );
    return redirect(error.toRedirectURL().toString(), { headers });
  }
}

export default function Page() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTo = sessionStorage.getItem("redirect_to") ?? "/";
    setTimeout(() => navigate(redirectTo, { replace: true }));
  }, [navigate]);

  return <CircularProgress />;
}
