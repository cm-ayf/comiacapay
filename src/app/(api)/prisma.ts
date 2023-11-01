import { PrismaClient } from "@prisma/client";
import * as Schema from "@/generated/schema";

declare global {
  var _prisma: PrismaClient | Promise<PrismaClient>;

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
