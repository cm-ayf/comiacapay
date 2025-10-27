import { redirectDocument } from "react-router";
import type { Route } from "./+types/auth.signout";
import { prismaContext } from "~/lib/context.server";
import { sidCookie } from "~/lib/cookie.server";
import { revokeToken } from "~/lib/oauth2/auth.server";
import { createPrismaSessionStorage } from "~/lib/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { getSession, destroySession } = createPrismaSessionStorage(
    prisma,
    sidCookie,
  );

  const session = await getSession(request.headers.get("Cookie"));

  try {
    const tokenResult = session.get("tokenResult");
    if (tokenResult) await revokeToken(tokenResult);
  } catch {}

  const url = new URL(request.url);
  return redirectDocument(url.searchParams.get("redirect_to") ?? "/", {
    headers: {
      "Set-Cookie": await destroySession(session, {
        secure: url.protocol === "https",
      }),
    },
  });
}
