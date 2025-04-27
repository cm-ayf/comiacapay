import { createCookie } from "react-router";

export const sidCookie = createCookie("session", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  maxAge: 31536000,
});
export const stateCookie = createCookie("state", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  maxAge: 600,
});
