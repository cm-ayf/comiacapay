import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
  foreignKey,
  primaryKey,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: text().primaryKey(),
  name: text(),
  username: text().notNull(),
  picture: text(),
  freshUntil: timestamp("fresh_until", { precision: 3 }).defaultNow().notNull(),
});

export const session = pgTable(
  "Session",
  {
    id: text().primaryKey(),
    sid: text().notNull(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    tokenResult: jsonb("token_result"),
    expires: timestamp({ precision: 3 }).notNull(),
  },
  (table) => [
    uniqueIndex("Session_sid_key").using("btree", table.sid.asc().nullsLast()),
  ],
);

export const guild = pgTable("Guild", {
  id: text().primaryKey(),
  name: text().notNull(),
  picture: text(),
  readRoleId: text("read_role_id"),
  registerRoleId: text("register_role_id"),
  writeRoleId: text("write_role_id"),
});

export const member = pgTable(
  "Member",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    guildId: text("guild_id")
      .notNull()
      .references(() => guild.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    read: boolean().notNull(),
    register: boolean().notNull(),
    write: boolean().notNull(),
    admin: boolean().notNull(),
    freshUntil: timestamp("fresh_until", { precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.guildId] })],
);

export const item = pgTable("Item", {
  id: text().primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guild.id, { onDelete: "restrict", onUpdate: "cascade" }),
  name: text().notNull(),
  picture: text(),
  issuedAt: timestamp("issued_at", { precision: 3 }).notNull(),
});

export const event = pgTable("Event", {
  id: text().primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guild.id, { onDelete: "restrict", onUpdate: "cascade" }),
  name: text().notNull(),
  date: timestamp({ precision: 3 }).notNull(),
  discounts: jsonb().default([]).notNull(),
});

export const display = pgTable(
  "Display",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    itemId: text("item_id")
      .notNull()
      .references(() => item.id, { onDelete: "restrict", onUpdate: "cascade" }),
    price: integer().notNull(),
    internalPrice: integer("internal_price"),
    dedication: boolean().default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.itemId] })],
);

export const receipt = pgTable("Receipt", {
  id: text().primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  total: integer().notNull(),
});

export const record = pgTable(
  "Record",
  {
    receiptId: text("receipt_id")
      .notNull()
      .references(() => receipt.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    eventId: text("event_id").notNull(),
    itemId: text("item_id").notNull(),
    count: integer().notNull(),
    internal: boolean().default(false).notNull(),
    dedication: boolean().default(false).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.receiptId, table.itemId] }),
    foreignKey({
      columns: [table.eventId, table.itemId],
      foreignColumns: [display.eventId, display.itemId],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);
