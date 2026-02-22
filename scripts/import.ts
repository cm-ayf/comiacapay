import fs from "fs/promises";
import { db } from "../drizzle";
import {
  user,
  guild,
  member,
  item,
  event,
  display,
  receipt,
  record,
} from "../drizzle/schema";

const json = await fs.readFile("tmp/db.json", "utf-8");
const { users, guilds, members, items, events, displays, receipts, records } =
  JSON.parse(json);

await db.transaction(async (tx) => {
  await tx.insert(user).values(users);
  await tx.insert(guild).values(guilds);
  await tx.insert(member).values(members);
  await tx.insert(item).values(items);
  await tx.insert(event).values(events);
  await tx.insert(display).values(displays);
  await tx.insert(receipt).values(receipts);
  await tx.insert(record).values(records);
});

await db.$client.end();
