import type { Guild } from "@prisma/client";
import type { APIGuildMember } from "discord-api-types/v10";
import { getCurrentUserGuildMember } from "../oauth2/auth.server";
import { prisma } from "../prisma.server";
import type { SessionData } from "../session.server";

const REFRESH_AFTER = 24 * 60 * 60 * 1000;

export function freshMember(
  { userId, tokenResult }: SessionData,
  guildId: string,
  refresh?: boolean,
) {
  return prisma.$transaction(async (prisma) => {
    const { guild, ...member } = await prisma.member.findUniqueOrThrow({
      where: {
        userId_guildId: { userId, guildId },
      },
      include: { guild: true },
    });
    refresh ??= member.freshUntil.getTime() < Date.now();
    if (!refresh) return member;

    const currentUserGuildMember = await getCurrentUserGuildMember(
      tokenResult,
      guildId,
    );
    return await prisma.member.update({
      where: {
        userId_guildId: { userId, guildId },
      },
      data: {
        read: hasPermission(currentUserGuildMember, guild, "read"),
        register: hasPermission(currentUserGuildMember, guild, "register"),
        write: hasPermission(currentUserGuildMember, guild, "write"),
        freshUntil: new Date(Date.now() + REFRESH_AFTER),
      },
    });
  });
}

function hasPermission(
  member: APIGuildMember,
  guild: Guild,
  permission: "read" | "register" | "write",
) {
  const roleId = guild[`${permission}RoleId`];
  return !roleId || roleId === guild.id || member.roles.includes(roleId);
}
