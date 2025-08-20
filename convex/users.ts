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
        .withIndex("discord", (q) => q.eq("discord", args.discord as string))
        .unique();
    }
    if (args.minecraft) {
      return await ctx.db
        .query("users")
        .withIndex("minecraft", (q) =>
          q.eq("minecraft", args.minecraft as string),
        )
        .unique();
    }
  },
});

export const registerUser = mutation({
  args: {
    discord: v.union(v.string(), v.null()),
    minecraft: v.string(),
    registeredAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      discord: args.discord,
      minecraft: args.minecraft,
      registeredAt: args.registeredAt ?? Date.now(),
      status: "registered",
    });
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
        .withIndex("minecraft", (q) =>
          q.eq("minecraft", args.minecraft as string),
        )
        .collect();
      return users.length > 0;
    }
    if (args.discord && args.discord.trim() !== "") {
      const users = await ctx.db
        .query("users")
        .withIndex("discord", (q) => q.eq("discord", args.discord as string))
        .collect();
      return users.length > 0;
    }

    // If we get here, the arguments were provided but invalid (empty strings)
    return false;
  },
});