import { z } from "zod";
import { fetchMutation } from "convex/nextjs";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../convex/_generated/api";

const schema = z.object({
  user: z.string(),
  reason: z.string(),
  timestamp: z.number(),
  mod: z.string(),
});

type Data = {
  user: Id<"users">;
  reason: string;
  timestamp: number;
  mod: Id<"users">;
};

export async function POST(req) {
  const data = schema.parse((await req.json()) as Data);

  await fetchMutation(api.moderation.kickUser, {
    user: data.user as Id<"users">,
    reason: data.reason,
    timestamp: data.timestamp,
    mod: data.mod as Id<"users">,
  })
}