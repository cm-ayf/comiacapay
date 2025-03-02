import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { PropsWithChildren } from "react";
import CardItemPicture from "./CardItemPicture";
import type { ClientDisplay } from "~/lib/schema";

export default function DisplayPanel({
  children,
  display,
}: PropsWithChildren<{ display: ClientDisplay }>) {
  return (
    <Card sx={{ display: "flex", flexDirection: "row" }}>
      <CardItemPicture item={display.item} />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent>
          <Typography sx={{ fontSize: "1.5em" }}>
            {display.item.name}
          </Typography>
          <Typography sx={{ fontSize: "1.5em" }}>¥{display.price}</Typography>
          {display.internalPrice !== null && (
            <Typography>¥{display.internalPrice}（部内）</Typography>
          )}
          {display.dedication && <Typography>献本あり</Typography>}
        </CardContent>
        <Box sx={{ flex: 1 }} />
        {children && <CardActions>{children}</CardActions>}
      </Box>
    </Card>
  );
}
