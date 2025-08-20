import { z } from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

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

  await fetchMutation(api.sessions.endSession, {
    user: user._id,
    joinedAt: data.timestamp,
  });
  return Response.json({
    status: true,
  })
}
