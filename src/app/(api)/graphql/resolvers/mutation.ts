import type { Resolvers } from "./types";
import type { Discount } from "@/generated/schema";
import { generateSnowflake } from "@/shared/snowflake";

function withoutNullableProps<T>(object: T): {
  [K in keyof T]: Exclude<T[K], null | undefined>;
} {
  const cloned = { ...object };
  for (const key in cloned) {
    if (cloned[key] == null) {
      delete cloned[key];
    }
  }
  return cloned as any;
}

export const Mutation: Resolvers["Mutation"] = {
  async createItem(_, { input }, context) {
    context.assertsPermissions(["write"]);
    return context.prisma.item.create({
      data: {
        ...input,
        id: generateSnowflake().toString(),
        guild: {
          connect: { id: context.member.guildId },
        },
      },
    });
  },
  async updateItem(_, { id, input }, context) {
    context.assertsPermissions(["read", "write"]);
    return context.prisma.item.update({
      where: { id, guildId: context.member.guildId },
      data: withoutNullableProps(input) ?? {},
    });
  },
  async deleteItem(_, { id }, context) {
    context.assertsPermissions(["write"]);
    await context.prisma.item.delete({
      where: { id, guildId: context.member.guildId },
    });
    return id;
  },

  async createEvent(_, { input }, context) {
    context.assertsPermissions(["write"]);
    return context.prisma.event.create({
      data: {
        ...input,
        id: generateSnowflake().toString(),
        guild: {
          connect: { id: context.member.guildId },
        },
      },
    });
  },
  async updateEvent(_, { id, input }, context) {
    context.assertsPermissions(["read", "write"]);
    return context.prisma.event.update({
      where: { id, guildId: context.member.guildId },
      data: withoutNullableProps(input) ?? {},
    });
  },
  async deleteEvent(_, { id }, context) {
    context.assertsPermissions(["write"]);
    await context.prisma.event.delete({
      where: { id, guildId: context.member.guildId },
    });
    return id;
  },
  async createSetDiscount(_, { eventId, input }, context) {
    context.assertsPermissions(["write"]);
    const newDiscount: Discount = {
      __typename: "SetDiscount",
      id: generateSnowflake().toString(),
      discount: input.discount,
      itemIds: [...input.itemIds],
    };
    await context.prisma.$transaction(async (prisma) => {
      const where = { id: eventId, guildId: context.member.guildId };
      const { discounts } = await prisma.event.findUniqueOrThrow({
        where,
        select: { discounts: true },
      });
      await prisma.event.update({
        where,
        data: { discounts: [...discounts, newDiscount] },
      });
    });
    return newDiscount;
  },
  async deleteDiscount(_, { eventId, id }, context) {
    context.assertsPermissions(["write"]);
    const { discounts } = await context.prisma.event.findUniqueOrThrow({
      where: { id: eventId, guildId: context.member.guildId },
      select: { discounts: true },
    });
    await context.prisma.event.update({
      where: { id: eventId, guildId: context.member.guildId },
      data: {
        discounts: discounts.filter((discount) => discount.id !== id),
      },
    });
    return id;
  },
  async createDisplay(_, { eventId, input }, context) {
    context.assertsPermissions(["write"]);
    const guildId = context.member.guildId;
    return context.prisma.display.create({
      data: {
        item: {
          connect: { id: input.itemId, guildId },
        },
        event: {
          connect: { id: eventId, guildId },
        },
        price: input.price,
      },
    });
  },
  async updateDisplay(_, { eventId, itemId, input }, context) {
    context.assertsPermissions(["read", "write"]);
    return context.prisma.display.update({
      where: {
        eventId_itemId: { eventId, itemId },
        event: { guildId: context.member.guildId },
      },
      data: withoutNullableProps(input) ?? {},
    });
  },
  async deleteDisplay(_, { eventId, itemId }, context) {
    context.assertsPermissions(["write"]);
    await context.prisma.display.delete({
      where: {
        eventId_itemId: { eventId, itemId },
        event: { guildId: context.member.guildId },
      },
    });
    return itemId;
  },

  async createReceipts(_, { eventId, input }, context) {
    context.assertsPermissions(["register"]);
    // make sure that the event is of the guild
    await context.prisma.event.findUniqueOrThrow({
      where: { id: eventId, guildId: context.member.guildId },
    });
    const { count } = await context.prisma.receipt.createMany({
      data: input.map((receipt) => ({
        ...receipt,
        userId: context.session.sub,
        eventId,
      })),
    });
    return count;
  },
  async deleteReceipts(_, { eventId, ids }, context) {
    context.assertsPermissions(["write"]);
    const { count } = await context.prisma.receipt.deleteMany({
      where: {
        id: { in: ids },
        event: { id: eventId, guildId: context.member.guildId },
      },
    });
    return count;
  },
};
