import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  event: {
    items: r.many.item({
      from: r.event.id.through(r.display.eventId),
      to: r.item.id.through(r.display.itemId),
    }),
    guild: r.one.guild({
      from: r.event.guildId,
      to: r.guild.id,
      optional: false,
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
      optional: false,
    }),
  },
  guild: {
    events: r.many.event(),
    items: r.many.item(),
  },
  user: {
    events: r.many.event(),
    sessions: r.many.session(),
  },
  member: {
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
      optional: false,
    }),
    guild: r.one.guild({
      from: r.member.guildId,
      to: r.guild.id,
      optional: false,
    }),
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
