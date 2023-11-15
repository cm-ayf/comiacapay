import type { Resolvers } from "./types";

export const EventResolver: Resolvers["Event"] = {
  guild(parent, _, context) {
    return context.prisma.event
      .findUniqueOrThrow({
        where: { id: parent.id },
      })
      .guild();
  },
  displays(parent, _, context) {
    return context.prisma.event
      .findUniqueOrThrow({
        where: { id: parent.id },
      })
      .displays({
        orderBy: {
          item: { issuedAt: "desc" },
        },
      });
  },
  receipts(parent, _, context) {
    return context.prisma.event
      .findUniqueOrThrow({
        where: { id: parent.id },
      })
      .receipts();
  },
};
