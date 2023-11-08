import "server-only";

import type { Prisma } from "@prisma/client";
import {
  RouteBases,
  type APIGuild,
  CDNRoutes,
  ImageFormat,
  type RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
} from "discord-api-types/v10";
import { getCurrentUserGuildMember } from "@/app/(api)/auth/oauth2";
import { toMemberUpsert } from "@/app/(api)/auth/sync";
import type { TokenSet } from "@/app/(api)/auth/tokenset";
import { initPrisma } from "@/app/(api)/prisma";

export async function upsertGuildAndMember({
  access_token,
  guild,
}: RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult) {
  const prisma = await initPrisma();

  const guildCreated = await prisma.guild.upsert(toGuildUpsert(guild));

  const member = await getCurrentUserGuildMember(access_token, guild.id);
  await prisma.member.upsert(toMemberUpsert(member, guildCreated, true));

  return guildCreated;
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
    select: {
      readRoleId: true,
      registerRoleId: true,
      writeRoleId: true,
    },
  };
}

function guildIcon(guild: APIGuild) {
  if (!guild.icon) return null;
  return (
    RouteBases.cdn + CDNRoutes.guildIcon(guild.id, guild.icon, ImageFormat.WebP)
  );
}

export async function upsertMember(
  { access_token }: Pick<TokenSet, "access_token">,
  guildId: string,
) {
  const prisma = await initPrisma();

  const guild = await prisma.guild.findUniqueOrThrow({
    where: { id: guildId },
  });

  const member = await getCurrentUserGuildMember(access_token, guildId);
  await prisma.member.upsert(toMemberUpsert(member, guild, true));
}
