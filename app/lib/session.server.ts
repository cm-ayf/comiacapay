import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { createSessionStorage, type Cookie } from "react-router";
import { Snowflake } from "./snowflake";
import { Prisma } from "~/generated/prisma/client";
import type { PrismaClient } from "~/generated/prisma/client";

export interface SessionData {
  userId: string;
  tokenResult: RESTPostOAuth2AccessTokenResult;
}

export function createPrismaSessionStorage(
  prisma: PrismaClient,
  cookie: Cookie,
) {
  return createSessionStorage<SessionData, unknown>({
    cookie,
    async createData({ userId = null, tokenResult = Prisma.DbNull }, expires) {
      if (!expires) return "";
      const id = Snowflake.generate().toString();
      const sid = crypto
        .getRandomValues(Buffer.alloc(32))
        .toString("base64url");
      await prisma.session.create({
        data: { id, sid, expires, tokenResult, userId },
      });
      return sid;
    },
    async readData(sid) {
      const session = await prisma.session.findUnique({
        where: { sid },
      });
      if (!session) return null;
      if (session.expires.getTime() < Date.now()) {
        await prisma.session.deleteMany({
          where: { sid },
        });
        return null;
      }

      const data: Partial<SessionData> = {};
      if (session.userId) data.userId = session.userId;
      if (session.tokenResult) data.tokenResult = session.tokenResult;
      return data;
    },
    async updateData(
      sid,
      { userId = null, tokenResult = Prisma.DbNull },
      expires,
    ) {
      if (!expires) {
        await prisma.session.deleteMany({
          where: { sid },
        });
      } else {
        await prisma.session.update({
          where: { sid },
          data: { userId, tokenResult, expires },
        });
      }
    },
    async deleteData(sid) {
      await prisma.session.deleteMany({
        where: { sid },
      });
    },
  });
}
