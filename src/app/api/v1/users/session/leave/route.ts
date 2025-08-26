import { z } from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

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

  const schema = z.object({
    username: z.string(),
    timestamp: z.number(),
  });
  const data = schema.parse(await req.json());

  if (
    data.username &&
    !(await fetchQuery(api.users.isValidUser, {
      minecraft: data.username,
    }))
  ) {
    return Response.json({
      status: false,
      reason: "Invalid username",
      code: 1,
      data: {
        username: data.username,
      },
    });
  }

  const user = await fetchQuery(api.users.queryUser, {
    minecraft: data.username,
  });

  if (!user) {
    return Response.json({
      status: false,
      reason: "User not found",
      code: 4,
      data: {
        username: data.username,
      },
    });
  }

  const profile = await fetchQuery(api.users.getProfile, {
    id: user._id,
    server: server._id,
  });

  if (!profile) {
    return Response.json({
      status: false,
      reason: "User not found",
      code: 4,
      data: {
        username: data.username,
      },
    });
  }

  await fetchMutation(api.sessions.endSession, {
    user: profile._id,
    server: server._id,
    leftAt: data.timestamp,
  });
  return Response.json({
    status: true,
  });
}
