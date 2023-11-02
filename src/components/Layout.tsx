import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { PropsWithChildren, ReactNode } from "react";

export interface LayoutProps {
  navigation: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
}

export default function Layout({
  children,
  navigation,
  top,
  bottom,
}: PropsWithChildren<LayoutProps>) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {navigation}
      {top && <Box flex={0}>{top}</Box>}
      <Container
        sx={{
          flex: "auto",
          overflowX: "hidden",
          overflowY: "scroll",
          py: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Container>
      {bottom && <Box flex={0}>{bottom}</Box>}
    </Box>
  );
}
