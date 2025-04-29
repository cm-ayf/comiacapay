import type { Prisma } from "@prisma/client";
import { CDNRoutes, ImageFormat, RouteBases } from "discord-api-types/v10";
import type {
  APIGuild,
  RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
} from "discord-api-types/v10";
import type { unstable_RouterContextProvider } from "react-router";
import { getCurrentUser } from "../oauth2/auth.server";
import { prismaContext } from "~/root";

export async function upsertGuildAndMember(
  context: unstable_RouterContextProvider,
  {
    guild,
    ...tokenResult
  }: RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
) {
  const prisma = context.get(prismaContext);

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
