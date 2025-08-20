import { Router } from "express";
import { convex } from "../../../convex";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { Response } from "express";

export const router = Router();

const schema = z.object({
	user: z.string(),
	reason: z.string(),
	duration: z.number(),
	timestamp: z.number(),
	mod: z.string(),
});

type Data = {
	user: Id<"users">;
	reason: string;
	duration: number;
	timestamp: number;
	mod: Id<"users">;
};

router.post("/ban", async (req, res) => {
	const { user, reason, duration, timestamp, mod } = schema.parse(
		req.body
	) as Data;

	convex.mutation(api.moderation.banUser, {
		user,
		reason,
		duration,
		timestamp,
		mod,
	});
});

router.post("/mute", async (req, res) => {
	const { user, reason, duration, timestamp, mod } = schema.parse(
		req.body
	) as Data;

	convex.mutation(api.moderation.muteUser, {
		user,
		reason,
		duration,
		timestamp,
		mod,
	});
});

router.post("/kick", async (req, res) => {
	const schema = z.object({
		user: z.string(),
		reason: z.string(),
		timestamp: z.number(),
		mod: z.string(),
	});

	const { user, reason, timestamp, mod } = schema.parse(req.body) as Data;

	convex.mutation(api.moderation.kickUser, {
		user,
		reason,
		timestamp,
		mod,
	});
});

router.get("/stream", async (req, res) => {
  let lastTimestamp = Date.now();
	async function checkConvex() {
    return await convex.query(api.moderation.fetchLatest, {
      timestamp: lastTimestamp,
    });
	}

	function sendMessage(
		res: Response,
		msg: Doc<"moderationLog">
	) {
		res.write(JSON.stringify(msg));
	}

	async function poll(res: Response) {
    const msgs = await checkConvex();
    lastTimestamp = Date.now();
		msgs.forEach((msg) => sendMessage(res, msg));
	}

	setInterval(poll, 200, res);
	await poll(res);
});
