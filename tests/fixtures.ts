import { test as base } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import type {
  Guild,
  Event,
  Item,
  Display,
  Receipt,
  User,
} from "@prisma/client";
import { Snowflake } from "~/lib/snowflake";

type Fixtures = {
  prisma: PrismaClient;
  guild: Guild;
  user: User & { signin: () => Promise<void> };
  items: [Item, Item];
  event: Event;
  displays: [Display, Display];
  receipts: [Receipt, Receipt, Receipt];
};

export const test = base.extend<Fixtures>({
  prisma: async ({}, use) => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await use(prisma);
    await prisma.$disconnect();
  },

  // Guild fixture
  guild: async ({ prisma }, use) => {
    const guild = await prisma.guild.create({
      data: {
        id: Snowflake.generate().toString(),
        name: "e2e-test",
      },
    });

    await use(guild);

    await prisma.$transaction(async (prisma) => {
      const events = await prisma.event.findMany({
        where: { guildId: guild.id },
      });
      const eventIdInEvents = { eventId: { in: events.map((e) => e.id) } };
      await prisma.record.deleteMany({ where: eventIdInEvents });
      await prisma.receipt.deleteMany({ where: eventIdInEvents });
      await prisma.display.deleteMany({ where: eventIdInEvents });
      await prisma.event.deleteMany({
        where: { guildId: guild.id },
      });
      await prisma.item.deleteMany({
        where: { guildId: guild.id },
      });
      await prisma.guild.delete({
        where: { id: guild.id },
      });
    });
  },

  // Session fixture
  user: async ({ page, prisma, guild }, use) => {
    const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60);
    const user = await prisma.user.create({
      data: {
        id: Snowflake.generate().toString(),
        username: "e2e-test",
        freshUntil: oneHourFromNow,
      },
    });
    await prisma.member.create({
      data: {
        userId: user.id,
        guildId: guild.id,
        read: true,
        register: true,
        write: true,
        admin: false,
        freshUntil: oneHourFromNow,
      },
    });

    const signin = async () => {
      const session = await prisma.session.create({
        data: {
          id: Snowflake.generate().toString(),
          sid: crypto.getRandomValues(Buffer.alloc(32)).toString("base64url"),
          userId: user.id,
          tokenResult: {
            access_token: "e2e-test-access-token",
            refresh_token: "e2e-test-refresh-token",
            scope: "identify guilds",
            token_type: "Bearer",
            expires_in: 3600,
          },
          expires: oneHourFromNow,
        },
      });
      await page.context().addCookies([
        {
          name: "session",
          value: Buffer.from(JSON.stringify(session.sid)).toString("base64url"),
          domain: "localhost",
          path: "/",
        },
      ]);
    };

    await use({ ...user, signin });

    // Cleanup
    await prisma.$transaction(async (prisma) => {
      const receipts = await prisma.receipt.findMany({
        where: { userId: user.id },
      });
      await prisma.record.deleteMany({
        where: {
          receiptId: { in: receipts.map((r) => r.id) },
        },
      });
      await prisma.receipt.deleteMany({
        where: { userId: user.id },
      });
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
      await prisma.member.deleteMany({
        where: { userId: user.id },
      });
      await prisma.user.delete({
        where: { id: user.id },
      });
    });
  },

  // Items fixture
  items: async ({ prisma, guild }, use) => {
    const items: [Item, Item] = [
      {
        id: Snowflake.generate().toString(),
        guildId: guild.id,
        name: "Item 1",
        picture: "https://placehold.jp/180x252.png?text=Item+1",
        issuedAt: new Date("2025-06-13"),
      },
      {
        id: Snowflake.generate().toString(),
        guildId: guild.id,
        name: "Item 2",
        picture: "https://placehold.jp/180x252.png?text=Item+2",
        issuedAt: new Date("2025-06-13"),
      },
    ];
    await prisma.item.createMany({ data: items });
    await use(items);
    // Cleanup by guild fixture
  },

  // Event fixture
  event: async ({ prisma, guild }, use) => {
    const event = await prisma.event.create({
      data: {
        id: Snowflake.generate().toString(),
        guildId: guild.id,
        name: "Event 1",
        date: new Date(),
      },
    });
    await use(event);
    // Cleanup by guild fixture
  },

  // Displays fixture
  displays: async ({ prisma, event, items: [item1, item2] }, use) => {
    const displays: [Display, Display] = [
      {
        itemId: item1.id,
        eventId: event.id,
        price: 1000,
        internalPrice: 500,
        dedication: false,
      },
      {
        itemId: item2.id,
        eventId: event.id,
        price: 2000,
        internalPrice: null,
        dedication: true,
      },
    ];
    await prisma.display.createMany({ data: displays });
    await use(displays);
    // Cleanup by guild fixture
  },

  // Receipts fixture
  receipts: async (
    { prisma, user, event, displays: [display1, display2] },
    use,
  ) => {
    const receipts: [Receipt, Receipt, Receipt] = [
      {
        id: Snowflake.generate().toString(),
        eventId: event.id,
        userId: user.id,
        total: 2 * display1.price,
      },
      {
        id: Snowflake.generate().toString(),
        eventId: event.id,
        userId: user.id,
        total: 1 * display1.internalPrice!,
      },
      {
        id: Snowflake.generate().toString(),
        eventId: event.id,
        userId: user.id,
        total: 3 * display1.price,
      },
    ];
    await prisma.receipt.createMany({ data: receipts });
    await prisma.record.createMany({
      data: [
        {
          eventId: event.id,
          itemId: display1.itemId,
          receiptId: receipts[0].id,
          count: 2,
        },
        {
          eventId: event.id,
          itemId: display1.itemId,
          receiptId: receipts[1].id,
          internal: true,
          count: 1,
        },
        {
          eventId: event.id,
          itemId: display1.itemId,
          receiptId: receipts[2].id,
          count: 3,
        },
        {
          eventId: event.id,
          itemId: display2.itemId,
          receiptId: receipts[2].id,
          count: 1,
          dedication: true,
        },
      ],
    });
    await use(receipts);
    // Cleanup by guild or user fixture
  },
});
