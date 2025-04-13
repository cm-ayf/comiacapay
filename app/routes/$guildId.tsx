import {
  data,
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import type { Route } from "./+types/$guildId";
import type { Handle } from "~/lib/handle";
import { getMemberOr4xx, getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId } = params;
  const member = await getMemberOr4xx(userId, guildId, "read");

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      items: {
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  if (!guild) throw data(null, 404);
  return data({ member, guild });
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
