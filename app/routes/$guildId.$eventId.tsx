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
import { EventParams } from "~/lib/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { userId } = await getSessionOr401(request);
  const { guildId, eventId } = parseParamsOr400(EventParams, params);
  await getMemberOr4xx(userId, guildId, "read");

  const event = await prisma.event.findUnique({
    where: { id: eventId, guildId },
    include: { displays: true },
  });

  if (!event) throw json(null, 404);
  return json(event);
}

export const handle: Handle<typeof loader> = {
  breadcrumbLabel: (event) => event?.name,
};

export function useEvent() {
  return useRouteLoaderData<typeof loader>("routes/$guildId.$eventId")!;
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
