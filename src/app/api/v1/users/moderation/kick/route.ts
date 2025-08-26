import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../convex/_generated/api";
import type { NextRequest } from "next/server";
import { KickEvent } from "~/server/client";
import { auth } from "~/server/auth";

const schema = z.object({
  user: z.string(),
  reason: z.string().optional(),
  timestamp: z.number(),
  mod: z.string(),
});

type Data = {
  user: Id<"users">;
  reason?: string;
  timestamp: number;
  mod: Id<"users">;
};

/*
Codes:
0: Success
4: Unauthorized
5: Error
*/

export async function POST(req: NextRequest) {
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

  const data = schema.parse(await req.json());

  const [user, mod] = await Promise.all([
    fetchQuery(api.users.queryUser, {
      minecraft: data.user,
    }),
    fetchQuery(api.users.queryUser, {
      minecraft: data.mod,
    }),
  ]);

  if (!user || !mod) {
    return Response.json({
      status: false,
      reason: "Error",
      code: 5,
      data: {
        user: user ? data.user : data.mod,
      },
    });
  }

  const [userProfile, modProfile] = await Promise.all([
    fetchQuery(api.users.getProfile, {
      id: user._id,
      server: server._id,
    }),
    fetchQuery(api.users.getProfile, {
      id: mod._id,
      server: server._id,
    }),
  ]);

  if (!userProfile || !modProfile) {
    return Response.json({
      status: false,
      reason: "Error",
      code: 5,
      data: {
        user: userProfile ? data.user : data.mod,
      },
    });
  }

  if (!(modProfile.status in ["admin", "moderator"])) {
    return Response.json({
      status: false,
      reason: "Unauthorized",
      code: 4,
      data: {
        mod: modProfile._id,
        rank: modProfile.status,
      },
    });
  }

  await fetchMutation(api.moderation.kickUser, {
    user: userProfile._id,
    reason: data.reason,
    timestamp: data.timestamp,
    mod: modProfile._id,
    server: server._id,
  });

  if (data.reason) {
    await KickEvent.withReason(user.minecraft, data.reason).send(
      server.serverIp,
      server.apiKey,
    );
  } else {
    await KickEvent.player(user.minecraft).send(server.serverIp, server.apiKey);
  }

  return Response.json({ status: true });
}
