import { createCookie } from "@vercel/remix";

console.log(import.meta.env.MODE);

export const sidCookie = createCookie("sid", {
  httpOnly: true,
  secure: import.meta.env.MODE === "production",
  path: "/",
  maxAge: 31536000,
});
export const stateCookie = createCookie("state", {
  httpOnly: true,
  secure: import.meta.env.MODE === "production",
  path: "/",
  sameSite: "lax",
  maxAge: 600,
});
