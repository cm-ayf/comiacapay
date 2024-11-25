import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { Guild, Member } from "@prisma/client";
import ClickableCard, { type ClickableCardProps } from "./ClickableCard";

const PERMISSIONS = ["register", "write"] as const;

export default function GuildCard({
  guild,
  member,
  ...props
}: ClickableCardProps & { guild: Guild; member: Member }) {
  return (
    <ClickableCard {...props}>
      <CardContent sx={{ textAlign: "center", textTransform: "none" }}>
        <Typography sx={{ fontSize: "1.5em", fontWeight: "bold" }}>
          {guild.name}
        </Typography>
        <Typography>
          権限：
          {PERMISSIONS.filter((p) => member[p])
            .map((p) => p.toUpperCase())
            .join(", ")}
        </Typography>
      </CardContent>
    </ClickableCard>
  );
}
