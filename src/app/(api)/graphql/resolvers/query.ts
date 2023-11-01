import type { Resolvers } from "./types";

export const Query: Resolvers["Query"] = {
  user(_, __, context) {
    return context.prisma.user.findUniqueOrThrow({
      where: { id: context.session.sub },
    });
  },
  guild(_, __, context) {
    context.assertsPermissions(["read"]);
    return context.prisma.guild.findUniqueOrThrow({
      where: { id: context.member.guildId },
    });
  },
  event(_, { id }, context) {
    context.assertsPermissions(["read"]);
    return context.prisma.event.findUniqueOrThrow({
      where: { id, guildId: context.member.guildId },
    });
  },
};
