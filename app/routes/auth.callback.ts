import { redirectDocument } from "react-router";
import type { Route } from "./+types/auth.callback";
import { stateCookie } from "~/lib/cookie.server";
import { env } from "~/lib/env.server";
import { exchangeCode } from "~/lib/oauth2/auth.server";
import { OAuth2Error } from "~/lib/oauth2/error";
import { getSession, commitSession } from "~/lib/session.server";
import { upsertUserAndMembers } from "~/lib/sync.server";

const rawKey = Buffer.from(env.DISCORD_OAUTH2_TRAMPOLINE_KEY, "base64url");
const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
  "encrypt",
  "decrypt",
]);

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { code, state, shouldTrampoline } =
      await retrieveAuthorizationResponse(request);
    if (shouldTrampoline) return await trampoline({ code, state });

    const stateFromCookie = await stateCookie.parse(
      request.headers.get("Cookie"),
    );
    if (!stateFromCookie)
      throw new OAuth2Error("invalid_request", "missing state in cookie");
    if (state.toString() !== stateFromCookie)
      throw new OAuth2Error("invalid_request", "state mismatch");

    const session = await getSession(request.headers.get("Cookie"));

    const tokenResult = await exchangeCode(code);
    session.set("tokenResult", tokenResult);

    const user = await upsertUserAndMembers(tokenResult);
    session.set("userId", user.id);

    return redirectDocument(state.searchParams.get("redirect_to") ?? "/", {
      headers: {
        "Set-Cookie": await commitSession(session, {
          maxAge: tokenResult.expires_in,
          secure: request.url.startsWith("https://"),
        }),
      },
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirectDocument(error.toRedirectLocation());
  }
}

interface AuthorizationResponse {
  code: string;
  state: URL;
  shouldTrampoline?: boolean;
}

async function retrieveAuthorizationResponse(
  request: Request,
): Promise<AuthorizationResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateFromQuery = url.searchParams.get("state");

  if (!code) throw new OAuth2Error("invalid_request", "missing code in query");
  if (!stateFromQuery)
    throw new OAuth2Error("invalid_request", "missing state in query");
  const state = URL.parse(stateFromQuery);
  if (!state)
    throw new OAuth2Error("invalid_request", "invalid state in query");

  const iv = url.searchParams.get("iv");
  if (iv) {
    const decryptedCodeBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Buffer.from(iv, "base64url") },
      key,
      Buffer.from(code, "base64url"),
    );
    const decryptedCode = Buffer.from(decryptedCodeBuffer).toString("utf-8");
    return { code: decryptedCode, state };
  }

  return { code, state, shouldTrampoline: state.origin !== url.origin };
}

async function trampoline({ code, state }: AuthorizationResponse) {
  const url = new URL("/auth/callback", state.origin);

  const iv = crypto.getRandomValues(Buffer.alloc(12));
  const encryptedCodeBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    Buffer.from(code, "utf-8"),
  );
  const encryptedCode = Buffer.from(encryptedCodeBuffer).toString("base64url");

  url.searchParams.set("code", encryptedCode);
  url.searchParams.set("state", state.toString());
  url.searchParams.set("iv", iv.toString("base64url"));
  return redirectDocument(url.toString());
}
