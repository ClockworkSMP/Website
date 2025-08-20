import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const banUser = mutation({
	args: {
		user: v.id("users"),
		mod: v.id("users"),
		reason: v.string(),
		timestamp: v.optional(v.number()),
		duration: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("moderationLog", {
			user: args.user,
			status: "active",
			moderator: args.mod,
			action: "ban",
			reason: args.reason,
			timestamp: args.timestamp ?? Date.now(),
			duration: args.duration,
		});
	},
});

export const kickUser = mutation({
	args: {
		user: v.id("users"),
		mod: v.id("users"),
		reason: v.string(),
		timestamp: v.optional(v.number()),
		duration: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("moderationLog", {
			user: args.user,
			status: "active",
			moderator: args.mod,
			action: "kick",
			reason: args.reason,
			timestamp: args.timestamp ?? Date.now(),
			duration: args.duration,
		});
	},
});

export const muteUser = mutation({
	args: {
		user: v.id("users"),
		mod: v.id("users"),
		reason: v.string(),
		timestamp: v.optional(v.number()),
		duration: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("moderationLog", {
			user: args.user,
			status: "active",
			moderator: args.mod,
			action: "mute",
			reason: args.reason,
			timestamp: args.timestamp ?? Date.now(),
			duration: args.duration,
		});
	},
});

export const fetchLatest = query({
	args: {
		timestamp: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("moderationLog")
			.withIndex("timestamp", (q) => q.gte("timestamp", args.timestamp))
			.collect();
	},
});