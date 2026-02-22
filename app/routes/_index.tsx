import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import { href, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import EventCard from "~/components/EventCard";
import GuildCard from "~/components/GuildCard";
import { dbContext, sessionContext } from "~/lib/context.server";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.get(dbContext);
  const { userId } = await context.get(sessionContext);

  const members = await db.query.member.findMany({
    where: { userId },
    with: { guild: true },
  });
  const recentEvents = await db.query.event.findMany({
    where: {
      guildId: {
        in: members.filter((member) => member.register).map((m) => m.guildId),
      },
      date: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    },
    orderBy: { date: "desc" },
  });

  return { members, recentEvents };
}

export default function Page() {
  const { members, recentEvents } = useLoaderData<typeof loader>();
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
      <Grid container spacing={2}>
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
      <Grid container spacing={2}>
        {recentEvents.map((event) => {
          const member = indexMemberByGuildId.get(event.guildId);
          if (!member) return null;

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
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
