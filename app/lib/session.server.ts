import { createSessionStorage, type Cookie } from "react-router";
import type { SessionContext } from "./context.server";
import type { PrismaClientWithExtensions } from "./prisma.server";
import { Snowflake } from "./snowflake";
import { Prisma } from "~/generated/prisma/client";

export function createPrismaSessionStorage(
  prisma: PrismaClientWithExtensions,
  cookie: Cookie,
) {
  return createSessionStorage<SessionContext & { isExisting: true }, unknown>({
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

      const data: Partial<SessionContext & { isExisting: true }> = {
        isExisting: true,
      };
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
