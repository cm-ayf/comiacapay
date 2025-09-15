// @ts-check

import fs from "fs/promises";
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

const json = await fs.readFile("tmp/db.json", "utf-8");
const { users, guilds, members, items, events, displays, receipts, records } =
  JSON.parse(json);

await prisma.$transaction([
  prisma.user.createMany({ data: users }),
  prisma.guild.createMany({ data: guilds }),
  prisma.member.createMany({ data: members }),
  prisma.item.createMany({ data: items }),
  prisma.event.createMany({ data: events }),
  prisma.display.createMany({ data: displays }),
  prisma.receipt.createMany({ data: receipts }),
  prisma.record.createMany({ data: records }),
]);
