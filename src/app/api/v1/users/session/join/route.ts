import { z } from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { env } from "~/env";
import type { NextRequest } from "next/server";

const CODES = {
  0: "Success",
  1: "Invalid username",
  200: "Banned",
  201: "Banned username",
  202: "Banned discord",

  3: "Invalid timestamp",
  4: "Error",
};

export async function POST(req: NextRequest) {
  const schema = z.object({
    username: z.string().min(1, "Username cannot be empty"),
    timestamp: z.number(),
  });
  const data = schema.parse(await req.json());

  // Additional validation to ensure username is not empty
  if (!data.username || data.username.trim() === "") {
    return Response.json({
      status: false,
      reason: "Invalid username",
      code: 1,
      data: {
        username: data.username,
      },
    });
  }

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
    return;
  }
  const user = await fetchQuery(api.users.queryUser, {
    minecraft: data.username,
  });

  if (!user) {
    return;
  }

  if (user.discord in env.BANNED_DISCORDS) {
    return Response.json({
      status: false,
      reason: "Invalid username",
      code: 201,
      data: {
        username: data.username,
      },
    });
    return;
  }

  if (user.minecraft in env.BANNED_MINECRAFT) {
    return Response.json({
      status: false,
      reason: "Invalid username",
      code: 202,
      data: {
        username: data.username,
      },
    });
    return;
  }

  await fetchMutation(api.sessions.createSession, {
    user: user._id,
    joinedAt: data.timestamp,
  });
  return Response.json({
    status: true,
  });
}
