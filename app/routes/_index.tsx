import Typography from "@mui/material/Typography";
import Container from "@mui/material-pigment-css/Container";
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { getCookies } from "~/lib/cookie.server";
import { verifySession } from "~/lib/jwt.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookies = await getCookies(request.headers);
    if (!cookies.session) throw new Error("Unauthorized");
    const session = await verifySession(cookies.session);
    return json(session);
  } catch {
    return json({ sub: null });
  }
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container sx={{ background: "lightgray" }}>
      <Typography variant="h1">Comiacapay</Typography>
      <Typography variant="body1">Welcome, {data.sub ?? "guest"}!</Typography>
    </Container>
  );
}
