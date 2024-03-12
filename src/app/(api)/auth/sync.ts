import type { Guild, Prisma, User } from "@prisma/client";
import {
  CDNRoutes,
  ImageFormat,
  PermissionFlagsBits,
  RouteBases,
} from "discord-api-types/v10";
import type { APIUser, APIGuildMember } from "discord-api-types/v10";
import {
  getCurrentUser,
  getCurrentUserGuildMember,
  getCurrentUserGuilds,
} from "./oauth2";
import type { AccessTokenSet } from "./tokenset";
import { initPrisma } from "@/app/(api)/prisma";

export async function upsertUserAndMembers(
  tokenSet: AccessTokenSet,
): Promise<User> {
  const prisma = await initPrisma();

  const currentUser = await getCurrentUser(tokenSet);
  const user = await prisma.user.upsert(toUserUpsert(currentUser));

  const currentUserGuilds = await getCurrentUserGuilds(tokenSet);
  const guilds = await prisma.guild.findMany({
    where: {
      id: { in: currentUserGuilds.map((guild) => guild.id) },
    },
  });
  // no Promise.all() for throttling
  for (const guild of guilds) {
    const member = await getCurrentUserGuildMember(tokenSet, guild.id);
    const currentUserGuild = currentUserGuilds.find((g) => g.id === guild.id);
    // somehow this may be undefined; it must be defined thanks to `where` query above
    if (!currentUserGuild) continue;

    const admin = Boolean(
      BigInt(currentUserGuild.permissions!) & PermissionFlagsBits.Administrator,
    );
    await prisma.member.upsert(toMemberUpsert(member, guild, admin));
  }

  return user;
}

function toUserUpsert(user: APIUser): Prisma.UserUpsertArgs {
  const attributes: Pick<
    Prisma.UserCreateInput,
    "name" | "username" | "picture"
  > = {
    name: user.global_name,
    username: user.username,
    picture: userAvatar(user),
  };
  return {
    where: { id: user.id },
    update: attributes,
    create: { id: user.id, ...attributes },
  };
}

function userAvatar(user: APIUser) {
  if (user.avatar === null) return null;
  return (
    RouteBases.cdn +
    CDNRoutes.userAvatar(user.id, user.avatar, ImageFormat.WebP)
  );
}

export function toMemberUpsert(
  member: APIGuildMember,
  guild: Guild,
  admin: boolean,
): Prisma.MemberUpsertArgs {
  const { id: guildId, readRoleId, registerRoleId, writeRoleId } = guild;
  const ids = { userId: member.user!.id, guildId };
  const permissions = {
    read: hasPermission(member, guildId, readRoleId),
    register: hasPermission(member, guildId, registerRoleId),
    write: hasPermission(member, guildId, writeRoleId),
    admin,
  } satisfies Prisma.MemberUpdateInput;
  return {
    where: { userId_guildId: ids },
    update: permissions,
    create: { ...ids, ...permissions },
  };
}

function hasPermission(
  member: APIGuildMember,
  guildId: string,
  roleId: string | null,
) {
  return !roleId || roleId === guildId || member.roles.includes(roleId);
}
