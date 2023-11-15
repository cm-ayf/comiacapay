const NEXT_PUBLIC_HOST = process.env["NEXT_PUBLIC_HOST"];
if (!NEXT_PUBLIC_HOST) throw new Error("NEXT_PUBLIC_HOST is not defined");
export const host = new URL(NEXT_PUBLIC_HOST);
