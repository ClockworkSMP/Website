import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../convex/_generated/api";
import type { NextRequest } from "next/server";

const schema = z.object({
  user: z.string(),
  reason: z.union([z.string(), z.null()]),
  duration: z.optional(z.number()),
  timestamp: z.number(),
  mod: z.string(),
});

type Data = {
  user: Id<"users">;
  reason?: string;
  duration?: number;
  timestamp: number;
  mod: Id<"users">;
};

export async function POST(req: NextRequest) {
  const data = schema.parse(await req.json() as () => Promise<Data>); 

  const user = await fetchQuery(api.users.queryUser, {
    minecraft: data.user,
  });

  if (!user) {
    return Response.json({
      status: false,
      reason: "Error",
      code: 5,
      data: {
        user: data.user,
      },
    });
  }

  const mod = await fetchQuery(api.users.queryUser, {
    minecraft: data.mod,
  });

  if (!mod) {
    return Response.json({
      status: false,
      reason: "Error",
      code: 5,
      data: {
        user: data.user,
      },
    });
  }

  if (!(mod.status in ["admin", "moderator", "helper"])) {
    return Response.json({
      status: false,
      reason: "Unauthorized",
      code: 4,
      data: {
        user: user._id,
        mod: mod._id,
        rank: mod.status,
      },
    });
  }

  await fetchMutation(api.moderation.warnUser, {
    user: user._id,
    reason: data.reason,
    duration: data.duration,
    timestamp: data.timestamp,
    mod: mod._id,
  });

  return Response.json({
    status: true,
  });
}
