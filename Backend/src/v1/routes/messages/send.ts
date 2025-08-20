import { Router } from "express";
import { z } from "zod";
import { convex } from "../../../convex";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const router = Router();

router.post("/mc", async (req, res) => {
  const schema = z.object({
    message: z.string(),
    fromUUID: z.string(),
    toUUID: z.optional(z.string()),
    msgId: z.string(),
    timestamp: z.number(),
  });

  const data = schema.parse(req.body);
  
  if (data.fromUUID && !(await convex.query(api.users.isValidUser, { minecraft: data.fromUUID }))) {
    return res.status(400).json({
      status: false,
      reason: "Invalid fromUUID",
      data: {
        fromUUID: data.fromUUID,
      }
    });
  }

  convex.mutation(api.messages.createMessage, {
    from: data.fromUUID as Id<"users">,
    to: data.toUUID as Id<"users">,
    message: data.message,
    loc: "minecraft",
    timestamp: data.timestamp,
  }) 
});
