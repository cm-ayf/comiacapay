import { CDNRoutes, ImageFormat, RouteBases } from "discord-api-types/v10";
import type {
  APIGuild,
  RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
} from "discord-api-types/v10";
import { data, type RouterContextProvider } from "react-router";
import { dbContext } from "../context.server";
import { guild as guildTable, member as memberTable } from "../db.server";
import { getCurrentUser } from "../oauth2/auth.server";
import { Prisma } from "~/generated/prisma/client";

export async function upsertGuildAndMember(
  context: Readonly<RouterContextProvider>,
  {
    guild,
    ...tokenResult
  }: RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult,
) {
  const db = context.get(dbContext);

  const currentUser = await getCurrentUser(tokenResult);

  const attributes: Pick<Prisma.GuildCreateInput, "name" | "picture"> = {
    name: guild.name,
    picture: guildIcon(guild),
  };

  const [refreshedGuild] = await db
    .insert(guildTable)
    .values({ id: guild.id, ...attributes })
    .onConflictDoUpdate({
      target: guildTable.id,
      set: attributes,
    })
    .returning();
  if (!refreshedGuild) throw data({ code: "NOT_FOUND", model: "Guild" }, 404);

  await db
    .insert(memberTable)
    .values({
      userId: currentUser.id,
      guildId: guild.id,
      read: false,
      register: false,
      write: false,
      admin: true,
    })
    .onConflictDoUpdate({
      target: [memberTable.userId, memberTable.guildId],
      set: { admin: true },
    });

  return refreshedGuild;
}

function guildIcon(guild: APIGuild) {
  if (!guild.icon) return null;
  return (
    RouteBases.cdn + CDNRoutes.guildIcon(guild.id, guild.icon, ImageFormat.WebP)
  );
}
