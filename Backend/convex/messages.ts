import { timeStamp } from "console";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const queryUserMessages = query({
	args: { user: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("messages")
			.withIndex("to", (q) => q.eq("to", args.user));
	},
});

export const queryRecievedDMs = query({
	args: { user: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("messages")
			.withIndex("to", (q) => q.eq("to", args.user));
	},
});

export const createMessage = mutation({
	args: {
		from: v.id("users"),
		to: v.optional(v.id("users")),
		loc: v.union(
			v.literal("discord"),
			v.literal("minecraft"),
			v.literal("console")
		),
		message: v.string(),
		timestamp: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("messages", {
			from: args.from,
			to: args.to,
			message: args.message,
			loc: args.loc,
			timestamp: args.timestamp,
		});
	},
});

export const fetchLatest = query({
	args: {},
	handler: async (ctx) => {
		const [msgs, joins, leaves] = await Promise.all([
			ctx.db
				.query("messages")
				.withIndex("streamedAt", (q) => q.eq("streamedAt", undefined))
				.collect(),
			ctx.db
				.query("sessions")
				.withIndex("joinStreamedAt", (q) =>
					q.eq("joinStreamedAt", undefined)
				)
				.collect(),
			ctx.db
				.query("sessions")
				.withIndex("leftStreamedAt", (q) =>
					q.eq("leftStreamedAt", undefined)
				)
				.filter((d) => d.not(d.eq("leftAt", undefined)))
				.collect(),
		]);
		const events = [
			...msgs.map((m) => ({ ...m, type: "message" as const, timestamp: m.timestamp })),
			...joins.map((j) => {
				return { ...j, type: "join" as const, timestamp: j.joinedAt };
			}),
			...leaves.map((l) => ({
				...l,
				type: "leave" as const,
				timestamp: l.leftAt as number,
			})),
		];
		events.sort((a, b) => a.timestamp - b.timestamp);
		return events;
	},
});

export const verifyStream = mutation({
	args: {
		msgIds: v.array(v.id("messages")),
		time: v.number(),
	},
	handler: async (ctx, args) => {
		await Promise.all(
			args.msgIds.map(async (id) => {
				await ctx.db.patch(id, {
					streamedAt: args.time,
				});
			})
		);
	},
});
