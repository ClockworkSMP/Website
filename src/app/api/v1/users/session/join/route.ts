import { z } from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { env } from "~/env";

const CODES = {
  0: "Success",
  1: "Invalid username",
  200: "Banned",
  201: "Banned username",
  202: "Banned discord",

  3: "Invalid timestamp",
  4: "Error",
};

export async function POST(req) {
  const schema = z.object({
    username: z.string(),
    timestamp: z.number(),
  });
  const data = schema.parse(req.json());

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
    return;
  }

  if (user.discord in env.banned_discords) {
    return Response.json({
      status: false,
      reason: "Invalid username",
      code: 201,
      data: {
        username: data.username,
      },
    });
  }

  if (user.minecraft in env.banned_minecraft) {
    return Response.json({
      status: false,
      reason: "Invalid username",
      code: 202,
      data: {
        username: data.username,
      },
    });
  }

  await fetchMutation(api.sessions.createSession, {
    user: user._id,
    joinedAt: data.timestamp,
  });
  return Response.json({
    status: true,
  })
}