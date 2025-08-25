import { api } from "../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

export async function POST(req: NextRequest) {
  const schema = z.object({
    tps: z.number(),
    online: z.number(),
  });

  const data = schema.parse(await req.json());

  await fetchMutation(api.config.setHealth, {
    tps: data.tps,
    online: data.online,
  });

  return Response.json({
    status: true,
    data: {
      tps: data.tps,
      online: data.online,
    },
  });
}

export async function GET(req: NextRequest) {
  const health = await fetchQuery(api.config.getHealth);
  return Response.json({
    status: true,
    data: health,
  });
}