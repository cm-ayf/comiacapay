import type { FieldValues, Resolver } from "react-hook-form";
import { data } from "react-router";
import { getValidatedBody } from "./body.server";
import { prisma } from "./prisma.server";
import { getSession, type SessionData } from "./session.server";

export async function getSessionOr401(request: Request): Promise<SessionData> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const tokenResult = session.get("tokenResult");
  if (!userId || !tokenResult) throw data({ code: "UNAUTHORIZED" }, 401);
  return { userId, tokenResult };
}

export async function getMemberOr4xx(
  userId: string,
  guildId: string,
  permission: "read" | "write" | "register" | "admin",
) {
  const member = await prisma.member.findUniqueOrThrow({
    where: {
      userId_guildId: { userId, guildId },
    },
  });
  if (!member[permission]) throw data({ code: "FORBIDDEN", permission }, 403);
  return member;
}

export async function getValidatedBodyOr400<T extends FieldValues>(
  request: Request,
  resolver: Resolver<T>,
) {
  const { errors, data: body } = await getValidatedBody<T>(request, resolver);
  if (errors) throw data({ code: "BAD_REQUEST", errors }, 400);
  return body!;
}
