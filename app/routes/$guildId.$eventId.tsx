import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import type { Handle } from "~/lib/handle";
import { prisma } from "~/lib/prisma.server";
import { getSession } from "~/lib/session.server";
import { Snowflake } from "~/lib/snowflake";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const guildId = Snowflake.parse(params["guildId"])?.toString();
  const eventId = Snowflake.parse(params["eventId"])?.toString();
  if (!guildId || !eventId) throw json(null, 400);

  const [member, event] = await Promise.all([
    prisma.member.findUnique({
      where: {
        userId_guildId: { userId: session.userId, guildId },
      },
    }),
    prisma.event.findUnique({
      where: { id: eventId, guildId },
      include: { displays: true },
    }),
  ]);
  if (!member?.read || !event) throw json(null, 404);

  return json(event);
}

export const handle: Handle<typeof loader> = {
  breadcrumbLabel: (event) => event.name,
};

export function useEvent() {
  return useRouteLoaderData<typeof loader>("routes/$guildId.$eventId")!;
}

export default function Page() {
  return <Outlet />;
}
