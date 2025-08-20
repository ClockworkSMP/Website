import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

export async function POST(req) {
  const schema = z.object({
    message: z.string(),
    fromUUID: z.string(),
    toUUID: z.optional(z.string()),
    timestamp: z.number(),
  });

  const data = schema.parse(req.body);

  if (
    data.fromUUID &&
    !(await fetchQuery(api.users.isValidUser, { minecraft: data.fromUUID }))
  ) {
    Response.json({
      status: false,
      reason: "Invalid fromUUID",
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

  Response.json({
    status: true,
  })
}
