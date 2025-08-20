import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
	args: {
		user: v.id("users"),
		joinedAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("sessions", {
			user: args.user,
			joinedAt: args.joinedAt ?? Date.now(),
		});
	},
});

export const endSession = mutation({
	args: {
		user: v.id("users"),
		leftAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("userAndLeft", (q) =>
				q.eq("user", args.user).eq("leftAt", args.leftAt)
			)
			.unique();

		if (!session) {
			return;
		}

		await ctx.db.patch(session._id, {
			leftAt: args.leftAt ?? Date.now(),
		});
	},
});

export const querySessions = query({
	args: {
		user: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("sessions")
			.withIndex("user", (q) => q.eq("user", args.user));
	},
});

export const getLastSession = query({
	args: {
		user: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("sessions")
			.withIndex("userAndLeft", (q) => q.eq("user", args.user))
			.order("desc")
			.first();
	},
});
