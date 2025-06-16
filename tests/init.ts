import { PrismaClient, type Guild, type Session } from "@prisma/client";
import { Snowflake } from "~/lib/snowflake";

const prisma = new PrismaClient();
let session: Session | null = null;
let guild: Guild | null = null;

export async function up() {
  const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60);
  session = await prisma.session.create({
    data: {
      id: Snowflake.generate().toString(),
      sid: crypto.getRandomValues(Buffer.alloc(32)).toString("base64url"),
      expires: oneHourFromNow,
      user: {
        create: {
          id: Snowflake.generate().toString(),
          username: "e2e-test",
          freshUntil: oneHourFromNow,
        },
      },
      tokenResult: {
        scope: "identify guilds",
        token_type: "Bearer",
        access_token: "e2e-test-access-token",
        refresh_token: "e2e-test-refresh-token",
        expires_in: 3600,
      },
    },
  });
  const guildId = Snowflake.generate().toString();
  guild = await prisma.guild.create({
    data: {
      id: guildId,
      name: "e2e-test",
      members: {
        create: {
          userId: session.userId!,
          read: true,
          register: true,
          write: true,
          admin: false,
          freshUntil: oneHourFromNow,
        },
      },
    },
  });
  return { session, guild };
}

export async function down() {
  if (guild) {
    await prisma.member.deleteMany({
      where: { guildId: guild.id },
    });

    const events = await prisma.event.findMany({
      where: { guildId: guild.id },
    });
    const eventIdInEvents = { eventId: { in: events.map((e) => e.id) } };
    await prisma.record.deleteMany({ where: eventIdInEvents });
    await prisma.receipt.deleteMany({ where: eventIdInEvents });
    await prisma.display.deleteMany({ where: eventIdInEvents });
    await prisma.event.deleteMany({
      where: { guildId: guild.id },
    });
    await prisma.item.deleteMany({
      where: { guildId: guild.id },
    });
    await prisma.guild.delete({
      where: { id: guild.id },
    });

    guild = null;
  }
  if (session) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    if (session.userId) {
      await prisma.user.delete({
        where: { id: session.userId },
      });
    }
    session = null;
  }
}
