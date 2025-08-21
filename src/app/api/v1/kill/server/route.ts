import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return Response.json({
    status: true,
  });
}

/*
Ok: { status: true }

Fail: { status: false, reason: string, method: ("throw" | "kick" | "ban" | "nuke" | "stop")[] }
*/