import { z } from "zod";
import { env } from "~/env";
const schema = z.object({
  username: z.string(),
});

export async function GET(req) {
  const {username} = schema.parse(await req.json());
  if (username in env.BANNED_MINECRAFT) {
    return Response.json({
      status: false,
      reason: "Error: Code 5",
      action: "throw",
      public: false,
    })
  }

  return Response.json({
    status: true,
  });
}