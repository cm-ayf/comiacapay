import { json, type Params } from "@remix-run/react";
import type { FieldValues, Resolver } from "react-hook-form";
import { safeParse, type BaseIssue, type BaseSchema } from "valibot";
import { getValidatedBody } from "./body.server";
import { prisma } from "./prisma.server";
import { getSession } from "./session.server";

export async function getSessionOr401(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const tokenResult = session.get("tokenResult");
  if (!userId) throw json(null, 401);
  return { userId, tokenResult };
}

export function parseParamsOr400<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, params: Params) {
  const { success, output, issues } = safeParse(schema, params);
  if (!success) throw json(issues, 400);
  return output;
}

export async function getMemberOr4xx(
  userId: string,
  guildId: string,
  permission: "read" | "write" | "register",
) {
  const member = await prisma.member.findUnique({
    where: {
      userId_guildId: { userId, guildId },
    },
  });
  if (!member?.read) throw json(null, 404);
  if (!member[permission]) throw json(null, 403);
  return member;
}

export async function getValidatedBodyOr400<T extends FieldValues>(
  request: Request,
  resolver: Resolver<T>,
) {
  const { errors, data } = await getValidatedBody<T>(request, resolver);
  if (errors) throw json(errors, 400);
  return data!;
}
