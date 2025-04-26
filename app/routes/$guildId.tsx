import { valibotResolver } from "@hookform/resolvers/valibot";
import Typography from "@mui/material/Typography";
import {
  data,
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import type { Route } from "./+types/$guildId";
import createErrorBoundary from "~/components/createErrorBoundary";
import type { Handle } from "~/lib/handle";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { UpdateGuild, type UpdateGuildOutput } from "~/lib/schema";
import { freshMember } from "~/lib/sync/member.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSessionOr401(request);
  const { guildId } = params;
  const member = await freshMember(session, guildId);
  if (!member.read) throw data(null, 403);

  const guild = await prisma.guild.findUniqueOrThrow({
    where: { id: guildId },
    include: {
      items: {
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  return { ...guild, members: [member] as const };
}

const resolver = valibotResolver(UpdateGuild);

export async function action({ request, params }: Route.ActionArgs) {
  const { guildId } = params;
  const { userId } = await getSessionOr401(request);
  await getMemberOr4xx(userId, guildId, "admin");

  const data = await getValidatedBodyOr400<UpdateGuildOutput>(
    request,
    resolver,
  );

  return await prisma.guild.update({
    where: { id: guildId },
    data,
  });
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
