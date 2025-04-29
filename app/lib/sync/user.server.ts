import {
  CDNRoutes,
  ImageFormat,
  PermissionFlagsBits,
  RouteBases,
  type APIUser,
} from "discord-api-types/v10";
import type { unstable_RouterContextProvider } from "react-router";
import { getCurrentUser, getCurrentUserGuilds } from "../oauth2/auth.server";
import { prismaContext, sessionContext } from "~/root";

const REFRESH_AFTER = 24 * 60 * 60 * 1000;

export async function freshUser(context: unstable_RouterContextProvider) {
  const prisma = context.get(prismaContext);
  const { userId, tokenResult } = context.get(sessionContext);
  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (Date.now() < user.freshUntil.getTime()) return user;

    const currentUser = await getCurrentUser(tokenResult);
    const refreshedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: currentUser.global_name,
        username: currentUser.username,
        picture: userAvatar(currentUser),
        freshUntil: new Date(Date.now() + REFRESH_AFTER),
      },
    });

    const currentUserGuilds = await getCurrentUserGuilds(tokenResult);
    const guilds = await prisma.guild.findMany({
      where: {
        id: { in: currentUserGuilds.map((g) => g.id) },
      },
      select: { id: true },
    });
    const existingGuildIds = new Set(guilds.map((g) => g.id));
    for (const guild of currentUserGuilds) {
      if (!existingGuildIds.has(guild.id)) continue;

      const admin = Boolean(
        BigInt(guild.permissions!) & PermissionFlagsBits.Administrator,
      );
      await prisma.member.upsert({
        where: {
          userId_guildId: { userId, guildId: guild.id },
        },
        update: { admin },
        create: {
          userId,
          guildId: guild.id,
          read: false,
          register: false,
          write: false,
          admin,
        },
      });
    }

    return refreshedUser;
  });
}

function userAvatar(user: APIUser) {
  if (user.avatar === null) return null;
  return (
    RouteBases.cdn +
    CDNRoutes.userAvatar(user.id, user.avatar, ImageFormat.WebP)
  );
}
