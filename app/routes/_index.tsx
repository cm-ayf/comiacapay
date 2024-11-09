import Typography from "@mui/material/Typography";
import Container from "@mui/material-pigment-css/Container";
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request);
    return json(session.user);
  } catch {
    return json({ id: null });
  }
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container sx={{ background: "lightgray" }}>
      <Typography variant="h1">Comiacapay</Typography>
      <Typography variant="body1">Welcome, {data.id ?? "guest"}!</Typography>
    </Container>
  );
}
