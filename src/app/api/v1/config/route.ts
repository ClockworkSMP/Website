import type { NextRequest } from "next/server";
import { configManager } from "~/server/config";
import { z } from "zod";

export async function GET(req: NextRequest) {
  return Response.json({
    status: true,
    data: configManager.toRecord(),
  });
}

export async function POST(req: NextRequest) {
  const schema = z.object({
    activeWhitelist: z.boolean(),
    maintenanceMode: z.boolean(),
  });
  const data = schema.parse(await req.json());
  
  configManager.fromRecord(data);

  return Response.json({
    status: true,
    data: configManager.toRecord(),
  });
}
