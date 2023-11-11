"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import type { PropsWithChildren, ReactNode } from "react";
import NoSSRSuspense from "./NoSSRSuspense";

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
      <ErrorBoundary errorComponent={ErrorComponent}>
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
          <NoSSRSuspense fallback={<CircularProgress />}>
            {children}
          </NoSSRSuspense>
        </Container>
        {bottom && <Box flex={0}>{bottom}</Box>}
      </ErrorBoundary>
    </Box>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  console.error(error);
  return null;
}
