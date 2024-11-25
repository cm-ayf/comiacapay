import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ClickableCard, { type ClickableCardProps } from "./ClickableCard";
import type { ClientEvent } from "~/lib/schema";

export default function EventCard({
  event,
  ...props
}: ClickableCardProps & { event: ClientEvent }) {
  return (
    <ClickableCard {...props}>
      <CardContent sx={{ textAlign: "center", textTransform: "none" }}>
        <Typography sx={{ fontWeight: "bold" }}>{event.name}</Typography>
        <Typography>
          {new Date(event.date).toLocaleDateString("ja-JP")}
        </Typography>
      </CardContent>
    </ClickableCard>
  );
}
