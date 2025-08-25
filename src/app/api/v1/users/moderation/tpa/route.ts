import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { NextRequest } from "next/server";
import { z } from "zod";

const reqSchema = z.object({
  type: z.literal("request"),
  from: z.string(),
  to: z.string(),
});

const respSchema = z.object({
  type: z.union([z.literal("accept"), z.literal("deny")]),
  user: z.string(),
  timestamp: z.number(),
});

/*
Codes:

- 0: Ok
- 1: Inavlid user
- 101: Unauthorised
- 102: User not found
-  
- 2: Invalid schema
*/

export async function POST(req: NextRequest) {
  const data = (await req.json()) as
    | z.infer<typeof reqSchema>
    | z.infer<typeof respSchema>;
  const reqData = reqSchema.safeParse(data);
  const respData = respSchema.safeParse(data);

  if (reqData.success) {
    await fetchMutation(api.moderation.createTpa, {
      from: reqData.data.from,
      to: reqData.data.to,
      timestamp: Date.now(),
    });
  } else if (respData.success) {
    const user = await fetchQuery(api.users.queryUser, {
      minecraft: respData.data.user
    })
    if (!user) {
      return Response.json({
        status: false,
        codes: 102
      })
    }
    if (respData.data.type == "accept") {
      await fetchMutation(api.moderation.acceptTpa, {
        user: user._id 
      })
    }
  } else {
    return Response.json({
      status: false,
      code: 2,
    });
  }
}
