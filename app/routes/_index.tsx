import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useEffect, useMemo, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/_index";
import EventCard from "~/components/EventCard";
import GuildCard from "~/components/GuildCard";
import { LinkComponent } from "~/components/LinkComponent";
import { getSessionOr401 } from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { userId } = await getSessionOr401(request);

  const members = await prisma.member.findMany({
    where: { userId },
    include: { guild: true },
  });
  const recentEvents = await prisma.event.findMany({
    where: {
      guildId: { in: members.map((m) => m.guildId) },
      date: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    },
    orderBy: { date: "desc" },
  });

  return { members, recentEvents };
}

async function prefetchRecentEvents(events: { id: string; guildId: string }[]) {
  await Promise.all(
    events.flatMap((event: { id: string; guildId: string }) => [
      fetch(
        `/${event.guildId}/${event.id}/register.data?${new URLSearchParams({
          _routes: "routes/$guildId,routes/$guildId.$eventId",
        })}`,
      ),
      fetch(
        `/__manifest?${new URLSearchParams({
          p: `/${event.guildId}/${event.id}/register`,
          // @ts-expect-error -- undocumented
          version: window.__reactRouterManifest?.version,
        })}`,
      ),
    ]),
  );
}

export default function Page() {
  const { members, recentEvents } = useLoaderData<typeof loader>();
  const indexMemberByGuildId = useMemo(
    () => new Map(members.map((m) => [m.guildId, m])),
    [members],
  );

  const didPrefetchRecentEventsRef = useRef(false);
  useEffect(() => {
    if (!didPrefetchRecentEventsRef.current)
      prefetchRecentEvents(recentEvents).catch(() => {});
    didPrefetchRecentEventsRef.current = true;
  }, [recentEvents]);

  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          サーバー
        </Typography>
        <Button LinkComponent={LinkComponent} href="/setup/start">
          追加・設定変更
        </Button>
      </Box>
      <Grid container spacing={16}>
        {members.map(({ guild, ...member }) => (
          <Grid key={guild.id}>
            <GuildCard guild={guild} member={member} href={`/${guild.id}`} />
          </Grid>
        ))}
      </Grid>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        最近のイベント
      </Typography>
      <Grid container spacing={16}>
        {recentEvents.map((event) => {
          const member = indexMemberByGuildId.get(event.guildId);
          if (!member?.register) return null;

          return (
            <Grid key={event.id}>
              <EventCard
                guild={member.guild}
                event={event}
                onClick={() =>
                  navigate(`/${member.guildId}/${event.id}/register`)
                }
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
