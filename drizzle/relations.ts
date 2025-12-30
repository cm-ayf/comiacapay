import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  event: {
    items: r.many.item({
      from: r.event.id.through(r.display.eventId),
      to: r.item.id.through(r.display.itemId),
    }),
    guild: r.one.guild({
      from: r.event.guildId,
      to: r.guild.id,
    }),
    users: r.many.user({
      from: r.event.id.through(r.receipt.eventId),
      to: r.user.id.through(r.receipt.userId),
    }),
  },
  item: {
    events: r.many.event(),
    guild: r.one.guild({
      from: r.item.guildId,
      to: r.guild.id,
    }),
  },
  guild: {
    events: r.many.event(),
    items: r.many.item(),
    users: r.many.user({
      from: r.guild.id.through(r.member.guildId),
      to: r.user.id.through(r.member.userId),
    }),
  },
  user: {
    guilds: r.many.guild(),
    events: r.many.event(),
    sessions: r.many.session(),
  },
  display: {
    receipts: r.many.receipt({
      from: [
        r.display.eventId.through(r.record.eventId),
        r.display.itemId.through(r.record.itemId),
      ],
      to: r.receipt.id.through(r.record.receiptId),
    }),
  },
  receipt: {
    displays: r.many.display(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
}));
