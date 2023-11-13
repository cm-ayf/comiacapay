import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import type { PropsWithChildren } from "react";
import { DEFAULT_ITEM_PICTURE } from "@/constant";

export default function ItemPanel({
  children,
  item,
}: PropsWithChildren<{
  item: { name: string; picture: string | null };
}>) {
  return (
    <Card sx={{ height: 220, width: "100%", display: "flex" }}>
      <CardMedia
        component="img"
        image={item.picture ?? DEFAULT_ITEM_PICTURE}
        alt={item.name}
        sx={{ width: 150 }}
      />
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ fontSize: "1.5em" }}>{item.name}</CardContent>
        <Box sx={{ flex: 1 }} />
        <CardActions
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          {children}
        </CardActions>
      </Box>
    </Card>
  );
}
