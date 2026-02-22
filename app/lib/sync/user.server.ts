import {
  CDNRoutes,
  ImageFormat,
  PermissionFlagsBits,
  RouteBases,
  type APIUser,
} from "discord-api-types/v10";
import { data, type RouterContextProvider } from "react-router";
import { schema } from "../db.server";
import { dbContext, sessionContext } from "../context.server";
import { getCurrentUser, getCurrentUserGuilds } from "../oauth2/auth.server";
import { eq } from "drizzle-orm";

const REFRESH_AFTER = 24 * 60 * 60 * 1000;

export async function freshUser(context: Readonly<RouterContextProvider>) {
  const db = context.get(dbContext);
  const { userId, tokenResult } = await context.get(sessionContext);

  return await db.transaction(async (db) => {
    const user = await db.query.user
      .findFirst({
        where: { id: userId },
      })
      .orThrow(data({ code: "NOT_FOUND", model: "User" }, 404));
    if (Date.now() < user.freshUntil.getTime()) return user;

    const currentUser = await getCurrentUser(tokenResult);
    const [refreshedUser] = await db
      .update(schema.user)
      .set({
        name: currentUser.global_name,
        username: currentUser.username,
        picture: userAvatar(currentUser),
        freshUntil: new Date(Date.now() + REFRESH_AFTER),
      })
      .where(eq(schema.user.id, currentUser.id))
      .returning();

    if (!refreshedUser) throw data({ code: "NOT_FOUND", model: "User" }, 404);

    const currentUserGuilds = await getCurrentUserGuilds(tokenResult);
    const guilds = await db.query.guild.findMany({
      where: {
        id: { in: currentUserGuilds.map((g) => g.id) },
      },
      columns: { id: true },
    });
    const existingGuildIds = new Set(guilds.map((g) => g.id));
    for (const guild of currentUserGuilds) {
      if (!existingGuildIds.has(guild.id)) continue;

      const admin = Boolean(
        BigInt(guild.permissions!) & PermissionFlagsBits.Administrator,
      );
      await db
        .insert(schema.member)
        .values({
          userId,
          guildId: guild.id,
          read: false,
          register: false,
          write: false,
          admin,
        })
        .onConflictDoUpdate({
          target: [schema.member.userId, schema.member.guildId],
          set: { admin },
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
