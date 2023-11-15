import type { Resolvers } from "./types";

export const GuildResolver: Resolvers["Guild"] = {
  me(parent, _, context) {
    return context.prisma.member.findUniqueOrThrow({
      where: {
        userId_guildId: {
          userId: context.session.sub,
          guildId: parent.id,
        },
      },
      include: { guild: true },
    });
  },
  events(parent, _, context) {
    return context.prisma.guild
      .findUniqueOrThrow({
        where: { id: parent.id },
      })
      .events({
        orderBy: { date: "desc" },
      });
  },
  items(parent, _, context) {
    return context.prisma.guild
      .findUniqueOrThrow({
        where: { id: parent.id },
      })
      .items({
        orderBy: { issuedAt: "asc" },
      });
  },
};
