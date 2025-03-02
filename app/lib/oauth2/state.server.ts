import { base64url } from "jose";

export function createState(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  params.set("h", base64url.encode(crypto.getRandomValues(new Uint8Array(32))));
  return params.toString();
}
