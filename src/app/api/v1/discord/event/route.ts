import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";


export async function POST(req: NextRequest) {
  const server = await auth(req);

  if (!server) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({});
}