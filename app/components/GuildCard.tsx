import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { MouseEventHandler } from "react";
import BaseCard from "./BaseCard";

export default function GuildCard({
  member,
  onClick,
}: {
  member: {
    guild: { name: string };
    register: boolean;
    write: boolean;
  };
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  const { guild, ...permissions } = member;
  return (
    <BaseCard onClick={onClick}>
      <CardContent sx={{ textAlign: "center", textTransform: "none" }}>
        <Typography sx={{ fontSize: "1.5em", fontWeight: "bold" }}>
          {guild.name}
        </Typography>
        <Typography>
          権限：
          {Object.entries(permissions)
            .filter(([, value]) => value === true)
            .map(([key]) => key.toUpperCase())
            .join(", ")}
        </Typography>
      </CardContent>
    </BaseCard>
  );
}
