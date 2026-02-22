import { createSessionStorage, type Cookie } from "react-router";
import type { SessionContext } from "./context.server";
import type { DrizzleDatabase } from "./db.server";
import { Snowflake } from "./snowflake";
import { session as sessionTable } from "./db.server";
import { eq } from "drizzle-orm";

export function createDrizzleSessionStorage(
  db: DrizzleDatabase,
  cookie: Cookie,
) {
  return createSessionStorage<SessionContext & { isExisting: true }, unknown>({
    cookie,
    async createData({ userId = null, tokenResult = null }, expires) {
      if (!expires) return "";
      const id = Snowflake.generate().toString();
      const sid = crypto
        .getRandomValues(Buffer.alloc(32))
        .toString("base64url");
      await db.insert(sessionTable).values({
        id,
        sid,
        expires,
        tokenResult,
        userId,
      });
      return sid;
    },
    async readData(sid) {
      const session = await db.query.session.findFirst({
        where: { sid },
      });
      if (!session) return null;
      if (session.expires.getTime() < Date.now()) {
        await db.delete(sessionTable).where(eq(sessionTable.sid, sid));
        return null;
      }

      const data: Partial<SessionContext & { isExisting: true }> = {
        isExisting: true,
      };
      if (session.userId) data.userId = session.userId;
      if (session.tokenResult) data.tokenResult = session.tokenResult;
      return data;
    },
    async updateData(sid, { userId = null, tokenResult = null }, expires) {
      if (!expires) {
        await db.delete(sessionTable).where(eq(sessionTable.sid, sid));
      } else {
        await db
          .update(sessionTable)
          .set({ userId, tokenResult, expires })
          .where(eq(sessionTable.sid, sid));
      }
    },
    async deleteData(sid) {
      await db.delete(sessionTable).where(eq(sessionTable.sid, sid));
    },
  });
}
