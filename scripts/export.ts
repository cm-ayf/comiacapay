import fs from "fs/promises";
import { db } from "../drizzle/index.ts";

const data = await db.transaction(async (tx) => {
  const users = await tx.query.user.findMany();
  const guilds = await tx.query.guild.findMany();
  const members = await tx.query.member.findMany();
  const items = await tx.query.item.findMany();
  const events = await tx.query.event.findMany();
  const displays = await tx.query.display.findMany();
  const receipts = await tx.query.receipt.findMany();
  const records = await tx.query.record.findMany();
  return { users, guilds, members, items, events, displays, receipts, records };
});

const json = JSON.stringify(data, null, 2);
await fs.writeFile("tmp/db.json", json);
