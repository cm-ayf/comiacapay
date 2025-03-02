import { createCookie } from "@vercel/remix";
import { env } from "./env.server";

const secure = env.DISCORD_OAUTH2_ORIGIN.startsWith("https:");

export const sidCookie = createCookie("session", {
  httpOnly: true,
  secure,
  path: "/",
  sameSite: "lax",
  maxAge: 31536000,
});
export const stateCookie = createCookie("state", {
  httpOnly: true,
  secure,
  path: "/",
  sameSite: "lax",
  maxAge: 600,
});
