import { CDNRoutes, ImageFormat, RouteBases } from "discord-api-types/v10";
import type {
  APIGuild,
  RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
} from "discord-api-types/v10";
import { getCurrentUser } from "../oauth2/auth.server";
import { prisma } from "../prisma.server";
import type { Prisma } from "~/generated/prisma";

export async function upsertGuildAndMember({
  guild,
  ...tokenResult
}: RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult) {
  const currentUser = await getCurrentUser(tokenResult);

  const attributes: Pick<Prisma.GuildCreateInput, "name" | "picture"> = {
    name: guild.name,
    picture: guildIcon(guild),
  };
  const refreshedGuild = await prisma.guild.upsert({
    where: { id: guild.id },
    update: attributes,
    create: { id: guild.id, ...attributes },
  });

  await prisma.member.upsert({
    where: {
      userId_guildId: { userId: currentUser.id, guildId: guild.id },
    },
    update: { admin: true },
    create: {
      userId: currentUser.id,
      guildId: guild.id,
      read: false,
      register: false,
      write: false,
      admin: true,
      // freshUntil: new Date(), // must be refreshed before any request
    },
  });

  return refreshedGuild;
}

function guildIcon(guild: APIGuild) {
  if (!guild.icon) return null;
  return (
    RouteBases.cdn + CDNRoutes.guildIcon(guild.id, guild.icon, ImageFormat.WebP)
  );
}
