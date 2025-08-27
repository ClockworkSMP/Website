import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const queryUser = query({
  args: {
    id: v.optional(v.id("users")),
    discord: v.optional(v.string()),
    minecraft: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      return await ctx.db.get(args.id);
    }
    if (args.discord) {
      return await ctx.db
        .query("users")
        .withIndex("discord", (q) => q.eq("discord", args.discord!))
        .unique();
    }
    if (args.minecraft) {
      return await ctx.db
        .query("users")
        .withIndex("minecraftUUID", (q) =>
          q.eq("minecraftUUID", args.minecraft!),
        )
        .unique();
    }
  },
});

export const queryProfile = query({
  args: {
    id: v.optional(v.id("users")),
    discord: v.optional(v.string()),
    minecraft: v.optional(v.string()),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      return await ctx.db
        .query("profile")
        .withIndex("serverUser", (q) =>
          q.eq("server", args.server).eq("user", args.id!),
        )
        .first();
    }
    let user = null;
    if (args.discord) {
      user = await ctx.db
        .query("users")
        .withIndex("discord", (q) => q.eq("discord", args.discord!))
        .unique();
    }
    if (args.minecraft) {
      user = await ctx.db
        .query("users")
        .withIndex("minecraftUUID", (q) =>
          q.eq("minecraftUUID", args.minecraft!),
        )
        .unique();
    }
    if (!user) {
      return null;
    }
    return await ctx.db
      .query("profile")
      .withIndex("serverUser", (q) =>
        q.eq("server", args.server).eq("user", user._id),
      )
      .first();
  },
});

export const bulkQueryUsers = query({
  args: {
    server: v.id("server"),
    discord: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return (
      await Promise.all(
        args.discord.map(async (d) =>
          ctx.db
            .query("users")
            .withIndex("discord", (q) => q.eq("discord", d))
            .unique(),
        ),
      )
    ).filter((u) => u !== null);
  },
});

export const registerUser = mutation({
  args: {
    discord: v.union(v.string(), v.null()),
    minecraftUUID: v.string(),
    minecraftName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      discord: args.discord,
      minecraftUUID: args.minecraftUUID,
      minecraftName: args.minecraftName,
      ips: [],
    });
  },
});

export const createProfile = mutation({
  args: {
    user: v.id("users"),
    server: v.id("server"),
    status: v.union(
      v.literal("banned"),
      v.literal("registered"),
      v.literal("pending"),
      v.literal("whitelisted"),
      v.literal("helper"),
      v.literal("moderator"),
      v.literal("admin"),
    ),

    registeredAt: v.optional(v.number()),
    whitelistedAt: v.optional(v.number()),
    bannedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profile", {
      server: args.server,
      user: args.user,
      status: args.status,
      registeredAt: args.registeredAt ?? Date.now(),
      whitelistedAt: args.whitelistedAt ?? Date.now(),
      bannedAt: args.bannedAt ?? Date.now(),
    });
  },
});

export const getProfile = query({
  args: {
    id: v.id("users"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profile")
      .withIndex("serverUser", (q) =>
        q.eq("server", args.server).eq("user", args.id),
      )
      .first();
  },
});

export const getserverProfiles = query({
  args: {
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profile")
      .withIndex("server", (q) => q.eq("server", args.server))
      .collect();
  },
});

export const getBulkUsers = query({
  args: {
    profiles: v.array(v.id("profile")),
  },
  handler: async (ctx, args) => {
    return (
      await Promise.all(
        args.profiles.map(async (p) => {
          const profile = await ctx.db.get(p);
          if (!profile) {
            return null;
          }
          return await ctx.db.get(profile.user);
        }),
      )
    ).filter((u) => u !== null);
  },
});

export const isValidUser = query({
  args: {
    id: v.optional(v.id("users")),
    minecraft: v.optional(v.string()),
    discord: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if any valid argument is provided
    if (!args.id && !args.minecraft && !args.discord) {
      return false;
    }

    if (args.id) {
      const user = await ctx.db.get(args.id);
      return user !== null;
    }
    if (args.minecraft && args.minecraft.trim() !== "") {
      const users = await ctx.db
        .query("users")
        .withIndex("minecraftUUID", (q) =>
          q.eq("minecraftUUID", args.minecraft!),
        )
        .collect();
      return users.length > 0;
    }
    if (args.discord && args.discord.trim() !== "") {
      const users = await ctx.db
        .query("users")
        .withIndex("discord", (q) => q.eq("discord", args.discord!))
        .collect();
      return users.length > 0;
    }

    // If we get here, the arguments were provided but invalid (empty strings)
    return false;
  },
});

export const linkMinecraftUser = mutation({
  args: {
    id: v.id("users"),
    minecraft: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      minecraftUUID: args.minecraft,
    });
  },
});

export const linkDiscordUser = mutation({
  args: {
    id: v.id("users"),
    discord: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      discord: args.discord,
    });
  },
});
