import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { isRouteErrorResponse, Link, type ErrorResponse } from "react-router";
import { enum_, literal, object, safeParse } from "valibot";
import { useUrlWithRedirectTo } from "~/lib/location";

export default function createErrorBoundary({
  default: Fallback = UnknownError,
  ...components
}: {
  [status: number]: (props: { error: ErrorResponse }) => ReactNode;
  default?: (props: { error: unknown }) => ReactNode;
} = {}) {
  components[401] ??= UnauthorizedError;
  components[403] ??= ForbiddenError;
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

const Forbidden = object({
  code: literal("FORBIDDEN"),
  permission: enum_({
    read: "read",
    register: "register",
    write: "write",
    admin: "admin",
  }),
});

function ForbiddenError({ error }: { error: ErrorResponse }) {
  const { success, output } = safeParse(Forbidden, error.data);
  if (success) {
    return (
      <Typography>
        {output.permission.toUpperCase()}権限がありません。
        <Link to="/help/permissions">権限について</Link>を確認してください。
      </Typography>
    );
  } else {
    return <UnknownError error={error} />;
  }
}

function UnknownError({ error }: { error: unknown }) {
  const s =
    error instanceof Error
      ? error.stack || error.message
      : JSON.stringify(error, null, 2);
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
