import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../env";
import { initPrisma } from "../prisma";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export async function GET(request: NextRequest) {
  const [type, token] = request.headers.get("authorization")?.split(" ") || [];
  if (type !== "Bearer" || !token) return new Response(null, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWKS);
    if (payload.sub !== env.HEALTHCHECK_ALLOWED_SUB)
      throw new Error("sub mismatch");
  } catch {
    return new Response(null, { status: 403 });
  }

  const prisma = await initPrisma();
  try {
    const count = await prisma.event.count();
    return NextResponse.json({ events: count });
  } catch {
    return new Response(null, { status: 500 });
  }
}
