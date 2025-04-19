import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { isRouteErrorResponse, Link, type ErrorResponse } from "react-router";
import { useUrlWithRedirectTo } from "~/lib/location";

export default function createErrorBoundary({
  default: Fallback = UnknownError,
  ...components
}: {
  [status: number]: (props: { error: ErrorResponse }) => ReactNode;
  default?: (props: { error: unknown }) => ReactNode;
} = {}) {
  components[401] ??= UnauthorizedError;
  return function ErrorBoundary({ error }: { error: unknown }) {
    if (isRouteErrorResponse(error)) {
      const Component = components[error.status] ?? Fallback;
      return <Component error={error} />;
    }

    return <Fallback error={error} />;
  };
}

function UnauthorizedError() {
  const signinUrl = useUrlWithRedirectTo("/auth/signin");
  return (
    <Typography>
      <Link to={signinUrl}>サインイン</Link>してください
    </Typography>
  );
}

function UnknownError({ error }: { error: unknown }) {
  const s =
    error instanceof Error ? error.stack : JSON.stringify(error, null, 2);
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="body2">不明なエラーが発生しました：</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <pre>
          <code>{s}</code>
        </pre>
      </AccordionDetails>
    </Accordion>
  );
}
