import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

export async function GET(req: NextRequest) {
  const server = await auth(req);
  if (!server) {
    return Response.json({
      status: false,
    }, {
      status: 401,
    });
  }

  return Response.json({
    status: true,
  });
}