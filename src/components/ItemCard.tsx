import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import type { MouseEventHandler } from "react";
import BaseCard from "./BaseCard";
import { DEFAULT_ITEM_PICTURE } from "@/constant";
import type { Item } from "@/generated/resolvers";

export default function ItemCard({
  item,
  onClick,
}: {
  item: Item;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <BaseCard onClick={onClick}>
      <CardMedia
        component="img"
        image={item.picture ?? DEFAULT_ITEM_PICTURE}
        alt={item.name}
        sx={{ width: 200, m: 2 }}
      />
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
