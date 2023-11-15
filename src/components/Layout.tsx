"use client";

import { ApolloError } from "@apollo/client";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import type { PropsWithChildren, ReactNode } from "react";
import NoSSRSuspense from "./NoSSRSuspense";
import { isSessionError } from "@/app/(web)/Apollo";

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
            gap: 2,
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
  if (error instanceof ApolloError && isSessionError(error)) return "";
  return (
    <Container sx={{ py: 2 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          エラーが発生しました（詳細）
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="pre">
            {JSON.stringify(error, null, 2)}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
