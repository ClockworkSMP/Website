import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import type { NextRequest } from "next/server";

const Codes = {
  0: "Success",
  1: "Invalid permission",
  101: "Timedout",
  102: "Banned",
  2: "Invalid message",
  3: "Invalid timestamp",
  4: "Invalid fromUUID",
  5: "Error",
}

export async function POST(req: NextRequest) {
  const schema = z.object({
    message: z.string(),
    fromUUID: z.string(),
    toUUID: z.optional(z.string()),
    timestamp: z.number(),
  });

  const data = schema.parse(req.json());

  if (
    data.fromUUID &&
    !(await fetchQuery(api.users.isValidUser, { minecraft: data.fromUUID }))
  ) {
    return Response.json({
      status: false,
      reason: "Invalid fromUUID",
      code: 4,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  const user = await fetchQuery(api.users.queryUser, {
    minecraft: data.fromUUID,
  });

  if (!user) {
    return Response.json({
      status: false,
      reason: "User not found",
      code: 4,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  if (user.status === "banned") {
    return Response.json({
      status: false,
      reason: "Banned",
      code: 102,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  const timedout = await fetchQuery(api.moderation.isTimedout, {
    user: user._id,
  });

  if (timedout) {
    return Response.json({
      status: false,
      reason: "Timedout",
      code: 101,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  await fetchMutation(api.messages.createMessage, {
    from: data.fromUUID as Id<"users">,
    to: data.toUUID as Id<"users">,
    message: data.message,
    loc: "minecraft",
    timestamp: data.timestamp,
  });

  return Response.json({
    status: true,
    code: 0
  });
}
