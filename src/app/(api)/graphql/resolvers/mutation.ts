import type { Resolvers } from "./types";
import type { DedicationDiscount, SetDiscount } from "@/generated/schema";
import { generateSnowflake } from "@/shared/snowflake";

function withoutUndefinedProps<
  Input extends object,
  NonNullables extends { [K in keyof Input]?: true } = {},
>(
  input: Input | null | undefined,
  nonnullables?: NonNullables,
): {
  [K in keyof Input]: NonNullables[K] extends true
    ? Exclude<Input[K], null | undefined>
    : Exclude<Input[K], undefined>;
} {
  if (!input) return {} as any;
  const cloned = { ...input };
  for (const key in input) {
    if (
      (nonnullables?.[key] && cloned[key] === null) ||
      cloned[key] === undefined
    ) {
      delete cloned[key];
    }
  }
  return cloned as any;
}

export const Mutation: Resolvers["Mutation"] = {
  async updateGuild(_, { guildId, input }, context) {
    context.assertsPermissions(["admin"]);
    return context.prisma.guild.update({
      where: { id: guildId },
      data: withoutUndefinedProps(input),
    });
  },

  async createItem(_, { input }, context) {
    context.assertsPermissions(["write"]);
    return context.prisma.item.create({
      data: {
        ...withoutUndefinedProps(input),
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
      data: withoutUndefinedProps(input, { name: true, issuedAt: true }),
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
      data: withoutUndefinedProps(input, { name: true, date: true }),
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
    const newDiscount: SetDiscount = {
      __typename: "SetDiscount",
      id: generateSnowflake().toString(),
      amount: input.amount,
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
  async createDedicationDiscount(_, { eventId, input }, context) {
    context.assertsPermissions(["write"]);
    const newDiscount: DedicationDiscount = {
      __typename: "DedicationDiscount",
      id: generateSnowflake().toString(),
      ...input,
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
  async upsertDisplay(_, { eventId, itemId, input }, context) {
    context.assertsPermissions(["write"]);
    const guildId = context.member.guildId;
    return context.prisma.display.upsert({
      where: {
        eventId_itemId: { eventId, itemId: itemId },
        event: { guildId },
      },
      create: {
        item: {
          connect: { id: itemId, guildId },
        },
        event: {
          connect: { id: eventId, guildId },
        },
        ...input,
      },
      update: input,
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
    await context.prisma.receipt.createMany({
      data: input.map((receipt) => ({
        ...receipt,
        userId: context.session.sub,
        eventId,
      })),
      skipDuplicates: true,
    });
    return context.prisma.receipt.findMany({
      where: {
        id: { in: input.map((receipt) => receipt.id) },
      },
    });
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
