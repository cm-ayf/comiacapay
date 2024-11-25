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
  if (!guildId) throw json(null, 400);

  const member = await prisma.member.findUnique({
    where: {
      userId_guildId: { userId: session.userId, guildId },
    },
    include: {
      guild: {
        include: {
          items: {
            orderBy: { issuedAt: "desc" },
          },
        },
      },
    },
  });
  if (!member?.read) throw json(null, 404);

  return json(member);
}

export const handle: Handle<typeof loader> = {
  breadcrumbLabel: ({ guild }) => guild.name,
};

export function useGuild() {
  const { guild } = useRouteLoaderData<typeof loader>("routes/$guildId")!;
  return guild;
}

export function useMember() {
  const { guild: _, ...member } =
    useRouteLoaderData<typeof loader>("routes/$guildId")!;
  return member;
}

export default function Page() {
  return <Outlet />;
}
