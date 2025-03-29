import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import type { Handle } from "~/lib/handle";
import {
  getMemberOr4xx,
  getSessionOr401,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { GuildParams } from "~/lib/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId } = parseParamsOr400(GuildParams, params);
  const member = await getMemberOr4xx(userId, guildId, "read");

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      items: {
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  if (!guild) throw json(null, 404);
  return json({ member, guild });
}

export const handle: Handle<typeof loader> = {
  breadcrumbLabel: (r) => r?.guild.name,
};

export function useGuild() {
  const { guild } = useRouteLoaderData<typeof loader>("routes/$guildId")!;
  return guild;
}

export function useMember() {
  const { member } = useRouteLoaderData<typeof loader>("routes/$guildId")!;
  return member;
}

export default function Page() {
  return <Outlet />;
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return !actionResult?.__neverRevalidate && defaultShouldRevalidate;
}
