import { PrismaClient } from "@prisma/client";
import * as Schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | Promise<PrismaClient>;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type Discounts = Schema.Discount[];
  }
}

export function initPrisma() {
  if (global._prisma) return global._prisma;
  const prisma = new PrismaClient();
  return (global._prisma = prisma.$connect().then(() => {
    global._prisma = prisma;
    return prisma;
  }));
}
