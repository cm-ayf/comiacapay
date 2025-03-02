import { PrismaClient } from "@prisma/client";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import * as Schema from "./schema";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type TokenResult = RESTPostOAuth2AccessTokenResult;
    type Discounts = Schema.Discount[];
  }
}

export const prisma = ((
  global as typeof globalThis & { prisma: PrismaClient }
).prisma = new PrismaClient());
