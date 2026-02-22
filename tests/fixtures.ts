import { test as base } from "@playwright/test";
import { db } from "../drizzle";
import {
  type Guild,
  type Event,
  type Item,
  type Display,
  type Receipt,
  type User,
  guild as guildTable,
  event as eventTable,
  item as itemTable,
  display as displayTable,
  receipt as receiptTable,
  record as recordTable,
  user as userTable,
  session as sessionTable,
  member as memberTable,
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
    await db.$client.end();
  },

  // Guild fixture
  guild: async ({ db }, use) => {
    const [guild] = await db
      .insert(guildTable)
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
        .delete(recordTable)
        .where(inArray(recordTable.eventId, eventIds));
      await db
        .delete(receiptTable)
        .where(inArray(receiptTable.eventId, eventIds));
      await db
        .delete(displayTable)
        .where(inArray(displayTable.eventId, eventIds));
      await db.delete(eventTable).where(eq(eventTable.guildId, guildId));
      await db.delete(itemTable).where(eq(itemTable.guildId, guildId));
      await db.delete(guildTable).where(eq(guildTable.id, guildId));
    });
  },

  // Session fixture
  user: async ({ page, db, guild }, use) => {
    const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60);
    const [user] = await db
      .insert(userTable)
      .values({
        id: Snowflake.generate().toString(),
        username: "e2e-test",
        freshUntil: oneHourFromNow,
      })
      .returning();

    const userId = user!.id;
    await db.insert(memberTable).values({
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
        .insert(sessionTable)
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
        .delete(recordTable)
        .where(inArray(recordTable.receiptId, receiptIds));
      await db.delete(receiptTable).where(eq(receiptTable.userId, userId));
      await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
      await db.delete(memberTable).where(eq(memberTable.userId, userId));
      await db.delete(userTable).where(eq(userTable.id, userId));
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
    await db.insert(itemTable).values(items);
    await use(items);
    // Cleanup by guild fixture
  },

  // Event fixture
  event: async ({ db, guild }, use) => {
    const [event] = await db
      .insert(eventTable)
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
    await db.insert(displayTable).values(displays);
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
    await db.insert(receiptTable).values(receipts);
    await db.insert(recordTable).values([
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
