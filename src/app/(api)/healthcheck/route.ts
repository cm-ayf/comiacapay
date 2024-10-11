import { NextRequest, NextResponse } from "next/server";
import { initPrisma } from "../prisma";

export async function GET(request: NextRequest) {
  const [type, token] = request.headers.get("authorization")?.split(" ") || [];
  if (type !== "Bearer" || token !== process.env["CRON_SECRET"])
    return new Response(null, { status: 401 });

  const prisma = await initPrisma();
  try {
    const count = await prisma.event.count();
    return NextResponse.json({ events: count });
  } catch {
    return new Response(null, { status: 500 });
  }
}
