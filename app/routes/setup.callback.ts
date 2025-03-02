import { redirect, type LoaderFunctionArgs } from "@vercel/remix";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  url.pathname = url.searchParams.has("code") ? `/setup/roles` : "/";
  return redirect(url.toString());
}
