import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { MouseEventHandler } from "react";
import BaseCard from "./BaseCard";
import type { Date } from "@/generated/schema";

export default function EventCard({
  event,
  onClick,
}: {
  event: { name: string; date: Date };
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <BaseCard onClick={onClick}>
      <CardContent sx={{ textAlign: "center", textTransform: "none" }}>
        <Typography sx={{ fontSize: "1.5em", fontWeight: "bold" }}>
          {event.name}
        </Typography>
        <Typography sx={{ fontSize: "1.2em" }}>
          {new Date(event.date).toLocaleDateString("ja-JP")}
        </Typography>
      </CardContent>
    </BaseCard>
  );
}
