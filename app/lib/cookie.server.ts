import { createCookie } from "@vercel/remix";
import { host } from "./host";

export const sidCookie = createCookie("sid", {
  httpOnly: true,
  secure: host.protocol === "https:",
  path: "/",
  maxAge: 31536000,
});
export const stateCookie = createCookie("state", {
  httpOnly: true,
  secure: host.protocol === "https:",
  path: "/",
  sameSite: "lax",
  maxAge: 600,
});
