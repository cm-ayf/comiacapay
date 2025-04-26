import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { ClientItem } from "~/lib/schema";

export default function CardItemPicture({ item }: { item: ClientItem }) {
  if (item.picture) {
    return (
      <CardMedia
        component="img"
        image={item.picture}
        alt={item.name}
        sx={(theme) => ({
          objectFit: "contain",
          backgroundColor: "grey.300",
          backdropFilter: "blur(16px)",
          height: 252,
          width: 180,
          [theme.breakpoints.up("sm")]: {
            height: 350,
            width: 250,
          },
        })}
      />
    );
  } else {
    return (
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "grey.300",
          height: 252,
          width: 180,
          [theme.breakpoints.up("sm")]: {
            height: 350,
            width: 250,
          },
        })}
      >
        <Typography sx={{ color: "grey.500", fontSize: "3rem" }}>
          {item.name}
        </Typography>
      </Box>
    );
  }
}
