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
        alt="Item picture"
        height={350}
        width={250}
        sx={{
          width: "auto",
          objectFit: "contain",
          backgroundColor: "grey.300",
        }}
      />
    );
  } else {
    return (
      <Box
        sx={[
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey.300",
            height: 350,
            minWidth: 250,
          },
        ]}
      >
        <Typography sx={{ color: "grey.500", fontSize: "3rem" }}>
          {item.name}
        </Typography>
      </Box>
    );
  }
}
