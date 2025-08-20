import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_WARNS = 3;

export const banUser = mutation({
  args: {
    user: v.id("users"),
    mod: v.id("users"),
    reason: v.union(v.string(), v.null()),
    timestamp: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      user: args.user,
      moderator: args.mod,
      action: "ban",
      reason: args.reason,
      timestamp: args.timestamp ?? Date.now(),
      expiresAt: args.duration ? Date.now() + args.duration : null,
    });
  },
});

export const kickUser = mutation({
  args: {
    user: v.id("users"),
    mod: v.id("users"),
    reason: v.union(v.string(), v.null()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      user: args.user,
      moderator: args.mod,
      action: "kick",
      reason: args.reason,
      timestamp: args.timestamp ?? Date.now(),
      expiresAt: null,
    });
  },
});

export const timeoutUser = mutation({
  args: {
    user: v.id("users"),
    mod: v.id("users"),
    reason: v.union(v.string(), v.null()),
    timestamp: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      user: args.user,
      moderator: args.mod,
      action: "timeout",
      reason: args.reason,
      timestamp: args.timestamp ?? Date.now(),
      expiresAt: args.duration ? Date.now() + args.duration : null,
    });
  },
});

export const warnUser = mutation({
  args: {
    user: v.id("users"),
    mod: v.id("users"),
    reason: v.union(v.string(), v.null()),
    timestamp: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      user: args.user,
      moderator: args.mod,
      action: "warn",
      reason: args.reason,
      timestamp: args.timestamp ?? Date.now(),
      expiresAt: args.duration ? Date.now() + args.duration : null,
    });
  },
});

export const getUserWarns = query({
  args: {
    user: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderationLog")
      .withIndex("userActionRevokedExpires", (q) =>
        q
          .eq("user", args.user)
          .eq("action", "warn")
          .eq("revokedAt", undefined)
          .lte("expiresAt", Date.now()),
      )
      .collect();
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

export const isTimedout = query({
  args: {
    user: v.id("users"),
  },
  handler: async (ctx, args) => {
    const timedout = await ctx.db
      .query("moderationLog")
      .withIndex("userActionRevokedExpires", (q) => 
        q.eq("user", args.user)
          .eq("action", "timeout")
          .eq("revokedAt", undefined)
          .lte("expiresAt", Date.now())
      )
			.unique()
		
		if (timedout) {
			return true;
		}

		const warns = await ctx.db
			.query("moderationLog")
			.withIndex("userActionRevokedExpires", (q) =>
				q.eq("user", args.user)
					.eq("action", "warn")
					.eq("revokedAt", undefined)
					.lte("expiresAt", Date.now())
			).collect();

		if (warns.length > MAX_WARNS) {
			return true;
		}

		return false;
  },
});
