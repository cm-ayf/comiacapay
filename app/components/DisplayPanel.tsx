import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { PropsWithChildren } from "react";
import CardItemPicture from "./CardItemPicture";
import { formatPrice } from "~/lib/price";
import type { ClientDisplay } from "~/lib/schema";

export default function DisplayPanel({
  children,
  display,
}: PropsWithChildren<{ display: ClientDisplay }>) {
  return (
    <Card sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <CardItemPicture item={display.item} />
      <Box
        sx={{
          alignSelf: "stretch",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardContent>
          <Typography sx={{ fontSize: "1.5em" }}>
            {display.item.name}
          </Typography>
          <Typography sx={{ fontSize: "1.5em" }}>
            {formatPrice(display.price)}
          </Typography>
          {display.internalPrice !== null && (
            <Typography>
              {formatPrice(display.internalPrice)}
              （部内）
            </Typography>
          )}
          {display.dedication && <Typography>献本あり</Typography>}
        </CardContent>
        {children && (
          <CardActions
            disableSpacing
            sx={{ flexDirection: "column", alignItems: "flex-start" }}
          >
            {children}
          </CardActions>
        )}
      </Box>
    </Card>
  );
}
