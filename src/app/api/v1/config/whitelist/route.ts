import type { NextRequest } from "next/server";
import { configManager } from "~/server/config";
import { z } from "zod";

export async function GET(req: NextRequest) {
  return Response.json({
    status: true,
    data: {
      activeWhitelist: configManager.activeWhitelist,
    },
  });
}

export async function POST(req: NextRequest) {
  const schema = z.object({
    activeWhitelist: z.boolean(),
  });
  const data = schema.parse(await req.json());
  configManager.activeWhitelist = data.activeWhitelist;
  return Response.json({
    status: true,
    data: {
      activeWhitelist: configManager.activeWhitelist,
    },
  });
}
