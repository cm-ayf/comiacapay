import { EventResolver } from "./event";
import { GuildResolver } from "./guild";
import { Mutation } from "./mutation";
import { Query } from "./query";
import type { Resolvers } from "./types";

export const resolvers: Resolvers = {
  User: {
    members(parent, _, context) {
      return context.prisma.member.findMany({
        where: { userId: parent.id },
      });
    },
  },
  Guild: GuildResolver,
  Member: {
    guild(parent, _, context) {
      context.assertsPermissions.bind({ member: parent })(["read"]);
      return context.prisma.guild.findUniqueOrThrow({
        where: { id: parent.guildId },
      });
    },
  },
  Item: {
    guild(parent, _, context) {
      return context.prisma.item
        .findUniqueOrThrow({
          where: { id: parent.id },
        })
        .guild();
    },
  },
  Event: EventResolver,
  Discount: {
    __resolveType(s) {
      return (s as any).__typename;
    },
  },
  Display: {
    item(parent, _, context) {
      return context.prisma.item.findUniqueOrThrow({
        where: { id: parent.itemId },
      });
    },
  },
  Receipt: {
    records(parent, _, context) {
      return context.prisma.receipt
        .findUniqueOrThrow({
          where: { id: parent.id },
        })
        .records();
    },
  },
  Record: {
    item(parent, _, context) {
      return context.prisma.item.findUniqueOrThrow({
        where: { id: parent.itemId },
      });
    },
  },
  Query,
  Mutation,
};
