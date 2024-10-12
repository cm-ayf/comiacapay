import { createCookie, type Cookie, type CookieOptions } from "@vercel/remix";
import { host } from "./host";

export type CookieName = "session" | "token_set" | "state" | "redirect_to";
export type CookieValues = Partial<Record<CookieName, string>>;

type TypedCookie = Cookie & { readonly name: CookieName };

function createTypedCookie(name: CookieName, options: CookieOptions) {
  return createCookie(name, options) as TypedCookie;
}

const baseOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: host.protocol === "https:",
  path: "/",
};

const cookies: TypedCookie[] = [
  createTypedCookie("session", { ...baseOptions, maxAge: 3600 }),
  createTypedCookie("token_set", { ...baseOptions, maxAge: 31557600 }),
  createTypedCookie("state", { ...baseOptions, sameSite: "lax", maxAge: 600 }),
  createTypedCookie("redirect_to", {
    ...baseOptions,
    sameSite: "lax",
    maxAge: 600,
  }),
];

export async function setCookies(cookieValues: CookieValues): Promise<Headers> {
  const headers = new Headers();
  for (const cookie of cookies) {
    const value = cookieValues[cookie.name];
    if (typeof value === "string") {
      const setCookie = await cookie.serialize(
        value,
        value ? {} : { maxAge: 0 },
      );
      headers.append("Set-Cookie", setCookie);
    }
  }
  return headers;
}

export async function getCookies(headers: Headers): Promise<CookieValues> {
  const values: CookieValues = {};
  const cookieHeader = headers.get("Cookie");
  for (const cookie of cookies) {
    values[cookie.name] = await cookie.parse(cookieHeader);
  }
  return values;
}
