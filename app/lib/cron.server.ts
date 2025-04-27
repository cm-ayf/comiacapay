export function isVercelCronRequest(request: Request): boolean {
  const [type, token] = request.headers.get("authorization")?.split(" ") ?? [];
  return type === "Bearer" && token === process.env["CRON_SECRET"];
}
