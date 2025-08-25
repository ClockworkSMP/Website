import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const approveWhitelist = mutation({
  args: {
    whitelistApp: v.id("whitelistAttempt"),
    whitelistedAt: v.optional(v.number()),
    reviewedBy: v.id("profile"),
  },
  handler: async (ctx, args) => {
    const whitelistAt = args.whitelistedAt ?? Date.now();

    const whitelist = await ctx.db.get(args.whitelistApp);

    if (!whitelist) {
      return;
    }

    const userId = whitelist.user;
    await ctx.db.patch(args.whitelistApp, {
      status: "approved",
      reviewedAt: whitelistAt,
      reviewedBy: args.reviewedBy,
    });

    await ctx.db.patch(userId, {
      whitelistedAt: whitelistAt,
      status: "whitelisted",
    });
  },
});

export const denyWhitelist = mutation({
  args: {
    whitelistApp: v.id("whitelistAttempt"),
    reviewedBy: v.id("profile"),
    reapply: v.number(),
    reason: v.string(),
    reviewedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.whitelistApp, {
      status: "denied",
      reviewedBy: args.reviewedBy,
      reviewedAt: args.reviewedAt ?? Date.now(),
      deniedReason: args.reason,
      reapplyWhen: args.reapply,
    });
  },
});

export const queryUserWhitelists = query({
  args: {
    user: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whitelistAttempt")
      .withIndex("user", (q) =>
        q.eq("server", args.server).eq("user", args.user),
      )
      .collect();
  },
});

export const queryWhitelist = query({
  args: {
    whitelist: v.id("whitelistAttempt"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.whitelist);
  },
});

export const createWhitelist = mutation({
  args: {
    server: v.id("server"),
    user: v.id("profile"),
    createdAt: v.optional(v.number()),

    data: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.user);
    if (!user) {
      return;
    }
    await ctx.db.insert("whitelistAttempt", {
      server: args.server,
      user: args.user,
      status: "pending",
      createdAt: args.createdAt ?? Date.now(),

      data: args.data,
    });
  },
});