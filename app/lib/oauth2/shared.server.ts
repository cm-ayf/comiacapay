import { OAuth2Error } from "./error";

export function oauth2Url(
  route: string,
  params: Record<string, string | boolean>,
) {
  const url = new URL(route);
  for (const [name, value] of Object.entries(params))
    url.searchParams.set(name, String(value));
  return url;
}
export async function oauth2Post(route: string, body: Record<string, string>) {
  const response = await fetch(route, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    cache: "no-cache",
  });

  if (response.status === 400) {
    const json = await response.json();
    throw OAuth2Error.fromJSON(json);
  } else if (!response.ok) {
    throw new Error();
  }

  return await response.json();
}
