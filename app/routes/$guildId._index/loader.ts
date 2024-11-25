import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { prisma } from "~/lib/prisma.server";
import { getSession } from "~/lib/session.server";
import { Snowflake } from "~/lib/snowflake";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const guildId = Snowflake.parse(params["guildId"])?.toString();
  if (!guildId) throw json(null, 400);

  const [member, events] = await prisma.$transaction([
    prisma.member.findUnique({
      where: {
        userId_guildId: { userId: session.userId, guildId },
      },
    }),
    prisma.event.findMany({
      where: { guildId },
      orderBy: { date: "desc" },
    }),
  ]);
  if (!member?.read) throw json(null, 404);

  return json(events);
}
