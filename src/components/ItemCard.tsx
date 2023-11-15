import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import type { MouseEventHandler } from "react";
import BaseCard from "./BaseCard";
import DummyItemPicture from "./DummyItemPicture";

export default function ItemCard({
  item,
  onClick,
}: {
  item: { name: string; picture: string | null };
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <BaseCard onClick={onClick}>
      {item.picture ? (
        <CardMedia
          component="img"
          image={item.picture}
          alt={item.name}
          sx={{ width: 200, m: 2 }}
        />
      ) : (
        <DummyItemPicture item={item} sx={{ width: 200, height: 250, m: 2 }} />
      )}

      <CardContent
        sx={{
          pt: 0,
          pb: 3,
          textAlign: "center",
          fontSize: "1.25rem",
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        {item.name}
      </CardContent>
    </BaseCard>
  );
}
