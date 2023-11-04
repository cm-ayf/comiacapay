import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense, type PropsWithChildren, type ReactNode } from "react";
import ErrorComponent from "./ErrorComponent";

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
        <ErrorBoundary errorComponent={ErrorComponent}>
          <Suspense fallback={<CircularProgress />}>{children}</Suspense>
        </ErrorBoundary>
      </Container>
      {bottom && <Box flex={0}>{bottom}</Box>}
    </Box>
  );
}
