import type { Guild, Prisma, User } from "@prisma/client";
import {
  CDNRoutes,
  ImageFormat,
  PermissionFlagsBits,
  RouteBases,
} from "discord-api-types/v10";
import type { APIUser, APIGuildMember, APIGuild } from "discord-api-types/v10";
import {
  getCurrentUser,
  getCurrentUserGuildMember,
  getCurrentUserGuilds,
} from "./oauth2.server";
import type { AccessTokenSet } from "./oauth2.server";
import { prisma } from "./prisma.server";

export async function upsertUserAndMembers(
  tokenSet: AccessTokenSet,
): Promise<User> {
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

export async function upsertGuildAndMember({
  guild,
  ...tokenResult
}: AccessTokenSet & { guild: APIGuild }) {
  const guildCreated = await prisma.guild.upsert(toGuildUpsert(guild));

  const member = await getCurrentUserGuildMember(tokenResult, guild.id);
  await prisma.member.upsert(toMemberUpsert(member, guildCreated, true));

  return guildCreated;
}

export async function upsertMember(tokenSet: AccessTokenSet, guildId: string) {
  const guild = await prisma.guild.findUniqueOrThrow({
    where: { id: guildId },
  });

  const member = await getCurrentUserGuildMember(tokenSet, guildId);
  await prisma.member.upsert(toMemberUpsert(member, guild, true));
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

function toMemberUpsert(
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

function toGuildUpsert(guild: APIGuild): Prisma.GuildUpsertArgs {
  const attributes = {
    name: guild.name,
    picture: guildIcon(guild),
  } satisfies Prisma.GuildUpdateInput;
  return {
    where: { id: guild.id },
    update: attributes,
    create: { id: guild.id, ...attributes },
  };
}

function guildIcon(guild: APIGuild) {
  if (!guild.icon) return null;
  return (
    RouteBases.cdn + CDNRoutes.guildIcon(guild.id, guild.icon, ImageFormat.WebP)
  );
}
