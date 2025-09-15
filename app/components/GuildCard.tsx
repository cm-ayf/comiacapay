import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ClickableCard, { type ClickableCardProps } from "./ClickableCard";
import type { ClientGuild, ClientMember } from "~/lib/schema";

const PERMISSIONS = ["register", "write", "admin"] as const;

export default function GuildCard({
  guild,
  member,
  ...props
}: ClickableCardProps & { guild: ClientGuild; member: ClientMember }) {
  return (
    <ClickableCard {...props} aria-label={guild.name}>
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
