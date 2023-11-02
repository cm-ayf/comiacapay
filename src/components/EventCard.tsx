import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import type { MouseEventHandler } from "react";
import BaseCard from "./BaseCard";
import type { Event } from "@/generated/resolvers";

export default function EventCard({
  event,
  onClick,
}: {
  event: Omit<Event, "discounts">;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <BaseCard onClick={onClick}>
      <CardContent sx={{ textAlign: "center", textTransform: "none" }}>
        <Box sx={{ fontSize: "1.5em", fontWeight: "bold" }}>{event.name}</Box>
        <Box sx={{ fontSize: "1em" }}>
          {new Date(event.date).toLocaleDateString("ja-JP")}
        </Box>
      </CardContent>
    </BaseCard>
  );
}
