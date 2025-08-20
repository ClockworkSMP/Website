import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const approveWhitelist = mutation({
	args: {
		whitelistApp: v.id("whitelistAttempt"),
		whitelistedAt: v.optional(v.number()),
		reviewedBy: v.id("users"),
	},
	handler: async (ctx, args) => {
		const whitelistAt = args.whitelistedAt
			? args.whitelistedAt
			: Date.now();

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
		user: v.id("users"),
		whitelistApp: v.id("whitelistAttempt"),
		reviewedBy: v.id("users"),
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
		user: v.id("users"),
	},
	handler: async (ctx, args) => {
    return await ctx.db
		.query("whitelistAttempt")
		.withIndex("user", (q) => q.eq("user", args.user));
	},
});

export const queryWhitelist = query({
	args: {
		whitelist: v.id("whitelistAttempt"),
	},
	handler: async (ctx, args) => {
    return await ctx.db.get(args.whitelist);
  }
});

export const createWhitelist = mutation({
	args: {
    user: v.id("users"),
    createdAt: v.optional(v.number()),
		age: v.number(),
		found: v.string(),
		interests: v.string(),
		otherSMP: v.boolean(),
		create: v.boolean(),
		goodAt: v.string(),
		town: v.union(
			v.literal("myOwn"),
			v.literal("other"),
			v.literal("none")
		),
		friends: v.id("users"),
		otherInfo: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.user)
    if (!user) {
      return
    }
    await ctx.db.insert("whitelistAttempt", {
		discord: user.discord,
		minecraft: user.minecraft,
		user: args.user,
		status: "pending",
		createdAt: args.createdAt ?? Date.now(),
		age: args.age,
		found: args.found,
		interests: args.interests,
		otherSMP: args.otherSMP,
		create: args.create,
		goodAt: args.goodAt,
		town: args.town,
		friends: args.friends,
		otherInfo: args.otherInfo,
	});
  }
});

export const createUserWhitelist = mutation({
  args: {
    discord: v.string(),
    minecraft: v.string(),
		createdAt: v.optional(v.number()),
		age: v.number(),
		found: v.string(),
		interests: v.string(),
		otherSMP: v.boolean(),
		create: v.boolean(),
		goodAt: v.string(),
		town: v.union(
			v.literal("myOwn"),
			v.literal("other"),
			v.literal("none")
		),
		friends: v.id("users"),
    otherInfo: v.string(),
    registeredAt: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const queryUser = await ctx.db.query("users").withIndex("discord", (q) => q.eq("discord", args.discord)).unique()

    let user

    if (!queryUser) {
      user = await ctx.db.insert("users", {
        discord: args.discord,
        minecraft: args.minecraft,
        status: "registered",
        registeredAt: args.registeredAt ?? Date.now()
      })
    } else {
      user = queryUser
    }

  }
});