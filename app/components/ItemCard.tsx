import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardItemPicture from "./CardItemPicture";
import ClickableCard, { type ClickableCardProps } from "./ClickableCard";
import type { ClientItem } from "~/lib/schema";

export default function ItemCard({
  item,
  ...props
}: ClickableCardProps & { item: ClientItem }) {
  return (
    <ClickableCard {...props}>
      <CardItemPicture item={item} />
      <CardContent
        sx={(theme) => ({
          width: 180,
          [theme.breakpoints.up("sm")]: {
            width: 250,
          },
        })}
      >
        <Typography
          sx={{ textAlign: "center", fontSize: "1.25rem", fontWeight: "bold" }}
        >
          {item.name}
        </Typography>
      </CardContent>
    </ClickableCard>
  );
}
