import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ClickableCard, { type ClickableCardProps } from "./ClickableCard";
import type { ClientEvent, ClientGuild } from "~/lib/schema";

export default function EventCard({
  guild,
  event,
  ...props
}: ClickableCardProps & {
  guild?: ClientGuild;
  event: Omit<ClientEvent, "displays">;
}) {
  return (
    <ClickableCard {...props} aria-label={event.name}>
      <CardContent sx={{ textAlign: "center", textTransform: "none" }}>
        {guild && (
          <Typography sx={{ fontSize: "1.5em" }}>{guild.name}</Typography>
        )}
        <Typography sx={{ fontSize: "1.5em", fontWeight: "bold" }}>
          {event.name}
        </Typography>
        <Typography>
          {new Date(event.date).toLocaleDateString("ja-JP")}
        </Typography>
      </CardContent>
    </ClickableCard>
  );
}
