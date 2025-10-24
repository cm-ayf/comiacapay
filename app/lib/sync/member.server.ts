import type { APIGuildMember } from "discord-api-types/v10";
import { data, type RouterContextProvider } from "react-router";
import {
  prismaContext,
  sessionContext,
  type MemberContext,
} from "../context.server";
import { getCurrentUserGuildMember } from "../oauth2/auth.server";
import type { Guild } from "~/generated/prisma/client";

const REFRESH_AFTER = 24 * 60 * 60 * 1000;

export async function freshMember(
  context: Readonly<RouterContextProvider>,
  guildId: string,
): Promise<MemberContext> {
  const prisma = context.get(prismaContext);
  const { userId, tokenResult } = await context.get(sessionContext);

  const member = await prisma.$transaction(async (prisma) => {
    const { guild, ...member } = await prisma.member.findUniqueOrThrow({
      where: {
        userId_guildId: { userId, guildId },
      },
      include: { guild: true },
    });
    if (Date.now() < member.freshUntil.getTime()) return member;

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
