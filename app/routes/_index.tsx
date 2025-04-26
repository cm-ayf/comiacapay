import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useMemo } from "react";
import { Form, href, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import EventCard from "~/components/EventCard";
import GuildCard from "~/components/GuildCard";
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

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const response = await serverLoader();
  prefetchRecentEvents(response.recentEvents).catch(() => {});
  return response;
}
clientLoader.hydrate = true as const;

async function prefetchRecentEvents(events: { id: string; guildId: string }[]) {
  await Promise.all(
    events.flatMap((event: { id: string; guildId: string }) => [
      fetch(
        `/${event.guildId}/${event.id}/register.data?${new URLSearchParams({
          _routes: "routes/$guildId,routes/$guildId.$eventId",
        })}`,
      ),
    ]),
  );
}

export default function Page() {
  const { members, recentEvents } = useLoaderData<typeof clientLoader>();
  const indexMemberByGuildId = useMemo(
    () => new Map(members.map((m) => [m.guildId, m])),
    [members],
  );

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          サーバー
        </Typography>
        <Button component={Link} to={href("/setup/start")}>
          追加・設定変更
        </Button>
      </Box>
      <Grid container spacing={16}>
        {members.map(({ guild, ...member }) => (
          <Grid key={guild.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <GuildCard
              guild={guild}
              member={member}
              to={href("/:guildId", { guildId: guild.id })}
            />
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

          const target = href("/:guildId/:eventId/register", {
            guildId: event.guildId,
            eventId: event.id,
          });

          return (
            <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <EventCard
                guild={member.guild}
                event={event}
                to={target}
                prefetch="render"
              />
              {/* for fog-of-war discovery */}
              <Form aria-hidden action={target} />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
