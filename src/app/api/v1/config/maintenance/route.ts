import type { NextRequest } from "next/server";
import { configManager } from "~/server/config";
import { z } from "zod";

export async function GET(req: NextRequest) {
  return Response.json({
    status: true,
    data: {
      maintenanceMode: configManager.maintenanceMode,
    },
  });
}

export async function POST(req: NextRequest) {
  const schema = z.object({
    maintenanceMode: z.boolean(),
  });
  const data = schema.parse(await req.json());
  configManager.maintenanceMode = data.maintenanceMode;
  return Response.json({
    status: true,
    data: {
      maintenanceMode: configManager.maintenanceMode,
    },
  });
}