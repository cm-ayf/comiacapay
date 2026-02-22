import type { APIGuildMember } from "discord-api-types/v10";
import { data, type RouterContextProvider } from "react-router";
import {
  dbContext,
  sessionContext,
  type MemberContext,
} from "../context.server";
import { schema } from "../db.server";
import { getCurrentUserGuildMember } from "../oauth2/auth.server";
import type { Guild } from "../db.server";
import { and, eq } from "drizzle-orm";

const REFRESH_AFTER = 24 * 60 * 60 * 1000;

export async function freshMember(
  context: Readonly<RouterContextProvider>,
  guildId: string,
): Promise<MemberContext> {
  const db = context.get(dbContext);
  const { userId, tokenResult } = await context.get(sessionContext);

  const member = await db.transaction(async (db) => {
    const { guild, ...member } = await db.query.member
      .findFirst({
        where: { userId, guildId },
        with: { guild: true },
      })
      .orThrow(data({ code: "NOT_FOUND", model: "Member" }, 404));
    if (Date.now() < member.freshUntil.getTime()) return member;

    const currentUserGuildMember = await getCurrentUserGuildMember(
      tokenResult,
      guildId,
    );
    const [refreshedMember] = await db
      .update(schema.member)
      .set({
        read: hasPermission(currentUserGuildMember, guild, "read"),
        register: hasPermission(currentUserGuildMember, guild, "register"),
        write: hasPermission(currentUserGuildMember, guild, "write"),
        freshUntil: new Date(Date.now() + REFRESH_AFTER),
      })
      .where(
        and(
          eq(schema.member.userId, userId),
          eq(schema.member.guildId, guildId),
        ),
      )
      .returning();
    if (!refreshedMember)
      throw data({ code: "NOT_FOUND", model: "Member" }, 404);
    return refreshedMember;
  });

  return {
    ...member,
    checkPermission: (permission) => {
      if (!member[permission])
        throw data({ code: "FORBIDDEN", permission }, 403);
    },
  };
}

function hasPermission(
  member: APIGuildMember,
  guild: Guild,
  permission: "read" | "register" | "write",
) {
  const roleId = guild[`${permission}RoleId`];
  return !roleId || roleId === guild.id || member.roles.includes(roleId);
}
