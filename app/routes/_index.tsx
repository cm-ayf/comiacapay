import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import GuildCard from "~/components/GuildCard";
import { initPrisma } from "~/lib/prisma.server";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const prisma = await initPrisma();
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
        <Button onClick={() => navigate("/guilds/initiate")}>
          追加・設定変更
        </Button>
      </Box>
      <Grid container spacing={2}>
        {data.map((member) => (
          <Grid key={member.guild.id}>
            <GuildCard
              member={member}
              onClick={() => navigate(`/${member.guild.id}`)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export function ErrorBoundary() {
  return <Typography>サインインしてください</Typography>;
}
