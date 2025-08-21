import type { NextRequest } from "next/server";
import { z } from "zod/v4";
import { configManager } from "~/server/config";

export async function POST(req: NextRequest) {
  const schema = z.object({
    tps: z.number(),
    online: z.number(),
  });

  const data = schema.parse(await req.json());

  configManager.tps = data.tps;
  configManager.online = data.online;

  return Response.json({
    status: true,
    data: {
      tps: data.tps,
      online: data.online,
    },
  });
}

export async function GET(req: NextRequest) {
  return Response.json({
    status: true,
    data: {
      tps: configManager.tps,
      online: configManager.online,
    },
  });
}