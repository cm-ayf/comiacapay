import type { LoaderFunctionArgs } from "@vercel/remix";
import { isVercelCronRequest } from "~/lib/cron.server";
import {
  deleteSession,
  getAllSessions,
  getSessionStatus,
  refreshSession,
} from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  if (!isVercelCronRequest(request))
    return new Response("Unauthorized", { status: 401 });

  const sessions = await getAllSessions();

  for (const session of sessions) {
    switch (getSessionStatus(session)) {
      case "didExpire":
        await deleteSession(session);
        continue;
      case "willExpireSoon":
        await refreshSession(session);
        continue;
    }
  }

  return new Response();
}
