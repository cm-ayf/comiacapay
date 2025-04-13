import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { data } from "react-router";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
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
  return data(members);
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

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
        {data.map(({ guild, ...member }) => (
          <Grid key={guild.id}>
            <GuildCard guild={guild} member={member} href={`/${guild.id}`} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
