import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_WARNS = 3;

export const banUser = mutation({
  args: {
    user: v.id("profile"),
    mod: v.id("profile"),
    reason: v.optional(v.string()),
    timestamp: v.optional(v.number()),
    duration: v.optional(v.number()),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      server: args.server,
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
    user: v.id("profile"),
    mod: v.id("profile"),
    reason: v.optional(v.string()),
    timestamp: v.optional(v.number()),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      server: args.server,
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
    server: v.id("server"),
    user: v.id("profile"),
    mod: v.id("profile"),
    reason: v.optional(v.string()),
    timestamp: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      server: args.server,
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
    server: v.id("server"),
    user: v.id("profile"),
    mod: v.id("profile"),
    reason: v.optional(v.string()),
    timestamp: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moderationLog", {
      server: args.server,
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
    user: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderationLog")
      .withIndex("userActionRevokedExpires", (q) =>
        q
          .eq("server", args.server)
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
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderationLog")
      .withIndex("timestamp", (q) =>
        q.eq("server", args.server).gte("timestamp", args.timestamp),
      )
      .collect();
  },
});

export const isTimedout = query({
  args: {
    user: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    const timedout = await ctx.db
      .query("moderationLog")
      .withIndex("userActionRevokedExpires", (q) =>
        q
          .eq("server", args.server)
          .eq("user", args.user)
          .eq("action", "timeout")
          .eq("revokedAt", undefined)
          .lte("expiresAt", Date.now()),
      )
      .unique();

    if (timedout) {
      return true;
    }

    const warns = await ctx.db
      .query("moderationLog")
      .withIndex("userActionRevokedExpires", (q) =>
        q
          .eq("server", args.server)
          .eq("user", args.user)
          .eq("action", "warn")
          .eq("revokedAt", undefined)
          .lte("expiresAt", Date.now()),
      )
      .collect();

    if (warns.length > MAX_WARNS) {
      return true;
    }

    return false;
  },
});

export const createTpa = mutation({
  args: {
    sever: v.id("server"),
    from: v.id("profile"),
    to: v.id("profile"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tpa", {
      server: args.sever,
      from: args.from,
      to: args.to,
      status: "pending",
    });
  },
});

export const acceptTpa = mutation({
  args: {
    id: v.id("tpa"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "accepted",
      chosenAt: args.timestamp,
    });
  },
});

export const denyTpa = mutation({
  args: {
    id: v.id("tpa"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "denied",
      chosenAt: args.timestamp,
    });
  },
});

export const getUserTpa = mutation({
  args: {
    id: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("tpa")
      .withIndex("userStatus", (q) =>
        q.eq("server", args.server).eq("to", args.id),
      )
      .first();
  },
});
