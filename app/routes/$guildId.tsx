import { valibotResolver } from "@hookform/resolvers/valibot";
import Typography from "@mui/material/Typography";
import {
  data,
  Outlet,
  createContext,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import type { Route } from "./+types/$guildId";
import createErrorBoundary from "~/components/createErrorBoundary";
import type { Member } from "~/generated/prisma/client";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import type { Handle } from "~/lib/handle";
import { createThenable, type Thenable } from "~/lib/middleware.server";
import { UpdateGuild } from "~/lib/schema";
import { freshMember } from "~/lib/sync/member.server";
import { prismaContext } from "~/root";

export const memberContext = createContext<Thenable<Member>>();
const memberMiddleware: Route.MiddlewareFunction = async (
  { context, params },
  next,
) => {
  context.set(
    memberContext,
    createThenable(freshMember, context, params.guildId),
  );
  return next();
};

export const unstable_middleware = [memberMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const member = await context.get(memberContext);
  if (!member.read) throw data({ code: "FORBIDDEN", permission: "read" }, 403);

  const guild = await prisma.guild.findUniqueOrThrow({
    where: { id: member.guildId },
    include: {
      items: {
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  return { ...guild, members: [member] as const };
}

const resolver = valibotResolver(UpdateGuild);

export async function action({ request, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, admin } = await context.get(memberContext);
  if (!admin) throw data({ code: "FORBIDDEN", permission: "admin" }, 403);

  const body = await getValidatedBodyOr400(request, resolver);

  const guild = await prisma.guild.update({
    where: { id: guildId },
    data: body,
  });

  // any guild member should refresh permissions after role update
  await prisma.member.updateMany({
    where: { guildId: guildId },
    data: { freshUntil: new Date() },
  });

  return guild;
}

export const handle: Handle<typeof loader> = {
  title: "{1}",
  getName: (r) => r?.name,
};

export function useGuild() {
  return useRouteLoaderData<typeof loader>("routes/$guildId")!;
}

export function useMember() {
  const {
    members: [member],
  } = useRouteLoaderData<typeof loader>("routes/$guildId")!;
  return member;
}

export default function Page() {
  return <Outlet />;
}

function GuildNotFound() {
  return (
    <Typography variant="body1">サーバーが見つかりませんでした</Typography>
  );
}

export const ErrorBoundary = createErrorBoundary({ 404: GuildNotFound });

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return !actionResult?.__neverRevalidate && defaultShouldRevalidate;
}
