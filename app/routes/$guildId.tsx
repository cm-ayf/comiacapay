import Typography from "@mui/material/Typography";
import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import type { Route } from "./+types/$guildId";
import createErrorBoundary from "~/components/createErrorBoundary";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import {
  createThenable,
  memberContext,
  prismaContext,
} from "~/lib/context.server";
import type { Handle } from "~/lib/handle";
import { UpdateGuild } from "~/lib/schema";
import { freshMember } from "~/lib/sync/member.server";

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

export const middleware: Route.MiddlewareFunction[] = [memberMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const prisma = context.get(prismaContext);
  const { checkPermission, ...member } = await context.get(memberContext);
  checkPermission("read");

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

export async function action({ request, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("admin");

  const body = await getValidatedFormDataOr400(request, UpdateGuild);

  const guild = await prisma.guild.update({
    where: { id: guildId },
    data: body,
  });

  // any guild member should refresh permissions after role update
  await prisma.member.updateMany({
    where: { guildId },
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
