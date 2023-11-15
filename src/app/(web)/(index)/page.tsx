"use client";

import { useSuspenseQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import GetGuildsQuery from "./GetGuilds.graphql";
import GuildCard from "@/components/GuildCard";

export default function Page() {
  const { data } = useSuspenseQuery(GetGuildsQuery);
  const router = useRouter();

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ fontSize: "2em" }}>
          サーバー
        </Typography>
        <Button onClick={() => router.push("/guilds/initiate")}>
          追加・設定変更
        </Button>
      </Box>
      <Grid container spacing={2}>
        {data.user.members.map((member) => (
          <Grid item key={member.guild.id}>
            <GuildCard
              member={member}
              onClick={() => router.push(`/${member.guild.id}`)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
