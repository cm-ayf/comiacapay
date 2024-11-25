import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { SxProp } from "@pigment-css/react";

export default function DummyItemPicture({
  item,
  sx,
}: {
  item: { name: string };
  sx: SxProp;
}) {
  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "grey.300",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography sx={{ color: "grey.500", fontSize: "3rem" }}>
        {item.name}
      </Typography>
    </Box>
  );
}
