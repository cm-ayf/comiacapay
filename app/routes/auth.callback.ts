import { redirectDocument } from "react-router";
import type { Route } from "./+types/auth.callback";
import { dbContext } from "~/lib/context.server";
import { sidCookie, stateCookie } from "~/lib/cookie.server";
import { env } from "~/lib/env.server";
import { exchangeCode, getCurrentUser } from "~/lib/oauth2/auth.server";
import { OAuth2Error } from "~/lib/oauth2/error";
import { createDrizzleSessionStorage } from "~/lib/session.server";
import { user as userTable } from "~/lib/db.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { getSession, commitSession } = createDrizzleSessionStorage(
    db,
    sidCookie,
  );

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

    const user = await getCurrentUser(tokenResult).catch((e) => {
      throw OAuth2Error.fromError(e, {
        error: "server_error",
        error_description: "Failed to get current user",
      });
    });
    session.set("userId", user.id);

    await db
      .insert(userTable)
      .values({ id: user.id, username: user.username })
      .onConflictDoNothing();

    return redirectDocument(state.searchParams.get("redirect_to") ?? "/", {
      headers: {
        "Set-Cookie": await commitSession(session, {
          secure: request.url.startsWith("https://"),
        }),
      },
    });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirectDocument(error.toRedirectLocation());
  }
}

let key: Promise<CryptoKey>;
async function getTrampolineKey() {
  if (!env.DISCORD_OAUTH2_TRAMPOLINE_KEY)
    throw new OAuth2Error("invalid_request");
  const rawKey = Buffer.from(env.DISCORD_OAUTH2_TRAMPOLINE_KEY, "base64url");
  return (key ??= crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]));
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
    const key = await getTrampolineKey();
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

  const key = await getTrampolineKey();
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
