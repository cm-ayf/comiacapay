import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import GuildCard from "~/components/GuildCard";
import { prisma } from "~/lib/prisma.server";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const members = await prisma.member.findMany({
    where: { userId: session.userId },
    include: { guild: true },
  });
  return json(members);
}

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          サーバー
        </Typography>
        <Button onClick={() => navigate("/setup/start")}>追加・設定変更</Button>
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
