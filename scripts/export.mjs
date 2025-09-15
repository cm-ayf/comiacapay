// @ts-check

import fs from "fs/promises";
import { PrismaClient } from "../app/generated/prisma/index.js";

const prisma = new PrismaClient();

const [users, guilds, members, items, events, displays, receipts, records] =
  await prisma.$transaction([
    prisma.user.findMany(),
    prisma.guild.findMany(),
    prisma.member.findMany(),
    prisma.item.findMany(),
    prisma.event.findMany(),
    prisma.display.findMany(),
    prisma.receipt.findMany(),
    prisma.record.findMany(),
  ]);

const json = JSON.stringify(
  { users, guilds, members, items, events, displays, receipts, records },
  null,
  2,
);
await fs.writeFile("tmp/db.json", json);
