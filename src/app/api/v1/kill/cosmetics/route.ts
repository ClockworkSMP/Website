import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  Response.json({
    status: true,
  });
}