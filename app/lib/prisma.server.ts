import { PrismaClient } from "@prisma/client";
import * as Schema from "./schema";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type Discounts = Schema.Discount[];
  }
}

export const prisma = ((
  global as typeof globalThis & { prisma: PrismaClient }
).prisma = new PrismaClient());
