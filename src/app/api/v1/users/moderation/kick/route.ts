import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../convex/_generated/api";
import type { NextRequest } from "next/server";

const schema = z.object({
  user: z.string(),
  reason: z.union([z.string(), z.null()]),
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
  const data = schema.parse(await req.json() as () => Promise<Data>);

  const queryUser = await fetchQuery(api.users.queryUser, {
    minecraft: data.user,
  });

  let user;
  if (!queryUser) {
    const newUser = await fetchMutation(api.users.registerUser, {
      minecraft: data.user,
      discord: null,
    });

    const fetchedUser = await fetchQuery(api.users.queryUser, {
      id: newUser,
    });

    if (!fetchedUser) {
      return Response.json({
        status: false,
        reason: "Error",
        code: 5,
        data: {
          user: data.user,
        },
      });
    }

    user = fetchedUser;
  } else {
    user = queryUser;
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

  if (!(mod.status in ["admin", "moderator"])) {
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

  await fetchMutation(api.moderation.kickUser, {
    user: user._id,
    reason: data.reason,
    timestamp: data.timestamp,
    mod: mod._id,
  });

  return Response.json({
    status: true,
    code: 0
  });
}
