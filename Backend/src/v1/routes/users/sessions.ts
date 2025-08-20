import { Router } from "express";
import { z } from "zod";
import { convex } from "../../../convex";
import { api } from "../../../../convex/_generated/api";
import env from "../../../env";

export const router = Router();

const CODES = {
	0: "Success",
	1: "Invalid username",
	200: "Banned",
	201: "Banned username",
	202: "Banned discord",

	3: "Invalid timestamp",
	4: "Error",
}

router.post("/join", async (req, res) => {
	const schema = z.object({
		username: z.string(),
		timestamp: z.number(),
	});
	const data = schema.parse(req.body);

	if (
		data.username &&
		!(await convex.query(api.users.isValidUser, {
			minecraft: data.username,
		}))
	) {
		return res.status(200).json({
			status: false,
			reason: "Invalid username",
			code: 1,
			data: {
				username: data.username,
			},
		});
	}

	const user = await convex.query(api.users.queryUser, {
		minecraft: data.username,
	});

	if (!user) {
		return;
	}

	if (user.discord in env.banned_discords) {
		return res.status(200).json({
			status: false,
			reason: "Invalid username",
			code: 201,
			data: {
				username: data.username,
			},
		});
	}

	if (user.minecraft in env.banned_minecraft) {
		return res.status(200).json({
			status: false,
			reason: "Invalid username",
			code: 202,
			data: {
				username: data.username,
			},
		});
	}

	convex.mutation(api.sessions.createSession, {
		user: user._id,
		joinedAt: data.timestamp,
	});
});

router.post("/leave", async (req, res) => {
	const schema = z.object({
		username: z.string(),
		timestamp: z.number(),
	});
	const data = schema.parse(req.body);

	if (
		data.username &&
		!(await convex.query(api.users.isValidUser, {
			minecraft: data.username,
		}))
	) {
		return res.status(200).json({
			status: false,
			reason: "Invalid username",
			code: 1,
			data: {
				username: data.username,
			},
		});
	}

	const user = await convex.query(api.users.queryUser, {
		minecraft: data.username,
	});

	if (!user) {
		return;
	}

	convex.mutation(api.sessions.endSession, {
		user: user._id,
		leftAt: data.timestamp,
	});
});