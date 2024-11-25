import type { Session, User } from "@prisma/client";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { base64url } from "jose";
import { sidCookie } from "./cookie.server";
import { refreshTokens, type RefreshTokenSet } from "./oauth2/auth.server";
import { prisma } from "./prisma.server";
import { Snowflake } from "./snowflake";

export async function getSession(request: Request) {
  const url = new URL(request.url);
  let sid = url.searchParams.get("sid");
  if (!sid) sid = await sidCookie.parse(request.headers.get("Cookie"));
  if (!sid) return null;

  const session = await prisma.session.findUnique({
    where: { sid },
  });
  if (!session) return null;
  if (getSessionStatus(session) === "didExpire") return null;
  return session;
}

export async function getAllSessions() {
  return await prisma.session.findMany();
}

export async function createSession(
  user: User,
  tokenResult: RESTPostOAuth2AccessTokenResult,
) {
  const id = Snowflake.generate().toString();
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
  if (timeLimit < 0) return "didExpire";
  else if (timeLimit < 86400000) return "willExpireSoon";
  else return "ok";
}

export async function deleteSession(session: Pick<Session, "id">) {
  await prisma.session.delete({
    where: { id: session.id },
  });
}

export async function refreshSession(session: Session) {
  const tokenResult = await refreshTokens(session);
  await prisma.session.update({
    where: { id: session.id },
    data: tokenResult,
  });

  return true;
}
