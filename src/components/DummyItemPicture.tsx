import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SystemCssProperties } from "@mui/system";

export default function DummyItemPicture({
  item,
  sx,
}: {
  item: { name: string };
  sx: SystemCssProperties;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey.300",
        ...sx,
      }}
    >
      <Typography sx={{ color: "grey.500", fontSize: "3rem" }}>
        {item.name}
      </Typography>
    </Box>
  );
}
