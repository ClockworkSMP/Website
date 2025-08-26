import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { z } from "zod";
import { api } from "../../../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Id } from "../../../../../../convex/_generated/dataModel";


export async function GET(req: NextRequest) {
  const server = await auth(req);

  if (!server) {
    return Response.json(
      {
        status: false,
      },
      {
        status: 401,
      },
    );
  }

  const schema = z.object({
    discord: z.optional(z.string()),
    minecraft: z.optional(z.string()),
    id: z.optional(z.string()),
  });

  const data = schema.parse(req.json());

  const user = await fetchQuery(api.users.queryUser, {
    discord: data.discord,
    minecraft: data.minecraft,
    id: data.id as Id<"users">,
  });

  if (!user) {
    return Response.json({
      status: true,
      data: {
        user: null,
        profile: null,
      }
    });
  }
  const profile = await fetchQuery(api.users.getProfile, {
    server: server._id,
    id: user._id,
  });

  return Response.json({
    status: true,
    data: {
      user,
      profile
    }
  });
}