import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getServer = query({
  args: {
    key: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.key);
  },
});

export const getServerFromApiKey = query({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("server")
      .withIndex("apiKey", (q) => q.eq("apiKey", args.apiKey))
      .unique();
  },
});

export const createServer = mutation({
  args: {
    name: v.string(),
    apiKey: v.string(),
    discordInvite: v.string(),
    discordGuild: v.string(),
    tpsChannel: v.string(),
    onlineChannel: v.string(),
    playersCategory: v.string(),
    whitelistChannel: v.string(),
    logChannel: v.string(),
    botToken: v.string(),
    tpaRank: v.union(
      v.literal("admin"),
      v.literal("mod"),
      v.literal("helper"),
      v.literal("whitelisted"),
    ),
    disableElytra: v.array(
      v.union(v.literal("end"), v.literal("overworld"), v.literal("nether")),
    ),
    disableDimension: v.array(
      v.union(v.literal("end"), v.literal("overworld"), v.literal("nether")),
    ),
    serverIp: v.string(),
    messagesChannel: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("server", {
      apiKey: args.apiKey,
      name: args.name,
      discordInvite: args.discordInvite,
      discordGuild: args.discordGuild,
      tpsChannel: args.tpsChannel,
      onlineChannel: args.onlineChannel,
      playersCategory: args.playersCategory,
      whitelistChannel: args.whitelistChannel,
      botToken: args.botToken,
      tpaRank: args.tpaRank,
      logChannel: args.logChannel,
      disableElytra: args.disableElytra,
      disableDimension: args.disableDimension,
      serverIp: args.serverIp,
      messagesChannel: args.messagesChannel,
    });
  },
});
