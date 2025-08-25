import type { GenericQueryCtx } from "convex/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { DataModel } from "./_generated/dataModel";

export const getConfig = query({
  handler: async (ctx) => {
    return await getLatestConfig(ctx);
  },
});

async function getLatestConfig(ctx: GenericQueryCtx<DataModel>) {
  return await ctx.db.query("config").order("desc").first();
}

export const setConfig = mutation({
  args: {
    activeWhitelist: v.optional(v.boolean()),
    maintenanceMode: v.optional(v.boolean()),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    const config = (await getLatestConfig(ctx)) ?? {
      activeWhitelist: true,
      maintenanceMode: true,
    };

    await ctx.db.insert("config", {
      server: args.server,
      activeWhitelist: args.activeWhitelist ?? config.activeWhitelist,
      maintenanceMode: args.maintenanceMode ?? config.maintenanceMode,
    });
  },
});

export const getHealth = query({
  handler: async (ctx) => {
    return await ctx.db.query("health").order("asc").first();
  },
});

export const setHealth = mutation({
  args: {
    tps: v.number(),
    online: v.number(),
    max: v.number(),
    players: v.array(v.id("profile")),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("health", {
      server: args.server,

      tps: args.tps,
      online: args.online,
      max: args.max,
      players: args.players,
    });
  },
});