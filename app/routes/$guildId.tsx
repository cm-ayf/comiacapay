import Typography from "@mui/material/Typography";
import { eq } from "drizzle-orm";
import {
  Outlet,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
  data,
} from "react-router";
import createErrorBoundary from "~/components/createErrorBoundary";
import { getValidatedFormDataOr400 } from "~/lib/body.server";
import { createThenable, memberContext, dbContext } from "~/lib/context.server";
import { schema } from "~/lib/db.server";
import type { Handle } from "~/lib/handle";
import { UpdateGuild } from "~/lib/schema";
import { freshMember } from "~/lib/sync/member.server";
import type { Route } from "./+types/$guildId";

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
  const db = context.get(dbContext);
  const { checkPermission, ...member } = await context.get(memberContext);
  checkPermission("read");

  const guild = await db.query.guild
    .findFirst({
      where: { id: member.guildId },
      with: {
        items: {
          orderBy: { issuedAt: "desc" },
        },
      },
    })
    .orThrow(data({ code: "NOT_FOUND", model: "Guild" }, 404));

  return { ...guild, members: [member] as const };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.get(dbContext);
  const { guildId, checkPermission } = await context.get(memberContext);
  checkPermission("admin");

  const body = await getValidatedFormDataOr400(request, UpdateGuild);

  return await db.transaction(async (db) => {
    const [guild] = await db
      .update(schema.guild)
      .set(body)
      .where(eq(schema.guild.id, guildId))
      .returning();
    if (!guild) throw data({ code: "NOT_FOUND", model: "Guild" }, 404);

    // any guild member should refresh permissions after role update
    await db
      .update(schema.member)
      .set({ freshUntil: new Date() })
      .where(eq(schema.member.guildId, guildId));

    return guild;
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
