import { test as base } from "@playwright/test";
import { db } from "../drizzle";
import * as schema from "../drizzle/schema";
import type {
  Guild,
  Event,
  Item,
  Display,
  Receipt,
  User,
} from "../drizzle/schema";
import { Snowflake } from "~/lib/snowflake";
import { eq, inArray } from "drizzle-orm";
type Fixtures = {
  db: typeof db;
  guild: Guild;
  user: User & { signin: () => Promise<void> };
  items: [Item, Item];
  event: Event;
  displays: [Display, Display];
  receipts: [Receipt, Receipt, Receipt];
};

export const test = base.extend<Fixtures>({
  // oxlint-disable-next-line no-empty-pattern
  db: async ({}, use) => {
    await use(db);
  },

  // Guild fixture
  guild: async ({ db }, use) => {
    const [guild] = await db
      .insert(schema.guild)
      .values({
        id: Snowflake.generate().toString(),
        name: "e2e-test",
      })
      .returning();

    await use(guild!);

    const guildId = guild!.id;
    await db.transaction(async (db) => {
      const events = await db.query.event.findMany({
        where: { guildId },
        columns: { id: true },
      });
      const eventIds = events.map((e) => e.id);

      await db
        .delete(schema.record)
        .where(inArray(schema.record.eventId, eventIds));
      await db
        .delete(schema.receipt)
        .where(inArray(schema.receipt.eventId, eventIds));
      await db
        .delete(schema.display)
        .where(inArray(schema.display.eventId, eventIds));
      await db.delete(schema.event).where(eq(schema.event.guildId, guildId));
      await db.delete(schema.item).where(eq(schema.item.guildId, guildId));
      await db.delete(schema.guild).where(eq(schema.guild.id, guildId));
    });
  },

  // Session fixture
  user: async ({ page, db, guild }, use) => {
    const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60);
    const [user] = await db
      .insert(schema.user)
      .values({
        id: Snowflake.generate().toString(),
        username: "e2e-test",
        freshUntil: oneHourFromNow,
      })
      .returning();

    const userId = user!.id;
    await db.insert(schema.member).values({
      userId,
      guildId: guild.id,
      read: true,
      register: true,
      write: true,
      admin: false,
      freshUntil: oneHourFromNow,
    });

    const signin = async () => {
      const [session] = await db
        .insert(schema.session)
        .values({
          id: Snowflake.generate().toString(),
          sid: crypto.getRandomValues(Buffer.alloc(32)).toString("base64url"),
          userId,
          tokenResult: {
            access_token: "e2e-test-access-token",
            refresh_token: "e2e-test-refresh-token",
            scope: "identify guilds",
            token_type: "Bearer",
            expires_in: 3600,
          },
          expires: oneHourFromNow,
        })
        .returning();
      await page.context().addCookies([
        {
          name: "session",
          value: Buffer.from(JSON.stringify(session!.sid)).toString(
            "base64url",
          ),
          domain: "localhost",
          path: "/",
        },
      ]);
    };

    await use({ ...user!, signin });

    // Cleanup
    await db.transaction(async (db) => {
      const receipts = await db.query.receipt.findMany({
        where: { userId },
        columns: { id: true },
      });
      const receiptIds = receipts.map((r) => r.id);

      await db
        .delete(schema.record)
        .where(inArray(schema.record.receiptId, receiptIds));
      await db.delete(schema.receipt).where(eq(schema.receipt.userId, userId));
      await db.delete(schema.session).where(eq(schema.session.userId, userId));
      await db.delete(schema.member).where(eq(schema.member.userId, userId));
      await db.delete(schema.user).where(eq(schema.user.id, userId));
    });
  },

  // Items fixture
  items: async ({ db, guild }, use) => {
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
    await db.insert(schema.item).values(items);
    await use(items);
    // Cleanup by guild fixture
  },

  // Event fixture
  event: async ({ db, guild }, use) => {
    const [event] = await db
      .insert(schema.event)
      .values({
        id: Snowflake.generate().toString(),
        guildId: guild.id,
        name: "Event 1",
        date: new Date(),
      })
      .returning();
    await use(event!);
    // Cleanup by guild fixture
  },

  // Displays fixture
  displays: async ({ db, event, items: [item1, item2] }, use) => {
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
    await db.insert(schema.display).values(displays);
    await use(displays);
    // Cleanup by guild fixture
  },

  // Receipts fixture
  receipts: async (
    { db, user, event, displays: [display1, display2] },
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
    await db.insert(schema.receipt).values(receipts);
    await db.insert(schema.record).values([
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
    ]);
    await use(receipts);
    // Cleanup by guild or user fixture
  },
});

test.afterAll(async () => {
  await db.$client.end();
});
