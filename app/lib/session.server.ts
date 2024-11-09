import type { Session, User } from "@prisma/client";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { base64url } from "jose";
import { sidCookie } from "./cookie.server";
import { refreshTokens, type RefreshTokenSet } from "./oauth2.server";
import { initPrisma } from "./prisma.server";
import { generateSnowflake } from "./snowflake";

export async function getSession(request: Request) {
  const prisma = await initPrisma();
  const sid = await sidCookie.parse(request.headers.get("Cookie"));
  return await prisma.session.findUniqueOrThrow({
    where: { sid },
    include: { user: true },
  });
}

export async function getAllSessions() {
  const prisma = await initPrisma();
  return await prisma.session.findMany();
}

export async function createSession(
  user: User,
  tokenResult: RESTPostOAuth2AccessTokenResult,
) {
  const prisma = await initPrisma();
  const id = generateSnowflake().toString();
  const sid = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
  const session = await prisma.session.create({
    data: {
      id,
      sid,
      ...tokenResult,
      user: {
        connect: { id: user.id },
      },
    },
  });
  return session;
}

export function getSessionStatus({ expires_in, updatedAt }: RefreshTokenSet) {
  const timeLimit = expires_in * 1000 + updatedAt.getTime() - Date.now();
  if (timeLimit < 0) return "shouldDelete";
  else if (timeLimit < 86400000) return "shouldRefresh";
  else return "ok";
}

export async function deleteSession(session: Pick<Session, "id">) {
  const prisma = await initPrisma();
  await prisma.session.delete({
    where: { id: session.id },
  });
}

export async function refreshSession(session: Session) {
  const prisma = await initPrisma();
  const tokenResult = await refreshTokens(session);
  await prisma.session.update({
    where: { id: session.id },
    data: tokenResult,
  });

  return true;
}
