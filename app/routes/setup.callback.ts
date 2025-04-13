import { redirect } from "react-router";
import type { Route } from "./+types/setup.callback";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  url.pathname = url.searchParams.has("code") ? `/setup/roles` : "/";
  return redirect(url.toString());
}
