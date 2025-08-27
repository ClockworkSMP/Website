import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const queryUserMessages = query({
	args: { user: v.id("profile"), server: v.id("server") },
	handler: async (ctx, args) => {
		return await ctx.db
      .query("messages")
      .withIndex("to", (q) => q.eq("server", args.server).eq("to", args.user))
      .collect();
	},
});

export const queryRecievedDMs = query({
  args: { user: v.id("profile"), server: v.id("server") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("to", (q) => q.eq("server", args.server).eq("to", args.user))
      .collect();
  },
});

export const createMessage = mutation({
  args: {
    from: v.id("profile"),
    to: v.optional(v.id("profile")),
    loc: v.union(
      v.literal("discord"),
      v.literal("minecraft"),
      v.literal("console"),
    ),
    minecraft: v.string(),
    discord: v.string(),
    raw: v.string(),
    timestamp: v.number(),
    server: v.id("server"),
    discordId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      server: args.server,
      from: args.from,
      to: args.to,
      loc: args.loc,
      timestamp: args.timestamp,
      minecraft: args.minecraft,
      discord: args.discord,
      raw: args.raw,
      discordId: args.discordId,
    });
  },
});

export const fetchLatest = query({
  args: {
    timestamp: v.number(),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    const [msgs, joins, leaves] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("timestamp", (q) =>
          q.eq("server", args.server).gte("timestamp", args.timestamp),
        )
        .collect(),
      ctx.db
        .query("sessions")
        .withIndex("joinedAt", (q) =>
          q.eq("server", args.server).gte("joinedAt", args.timestamp),
        )
        .collect(),
      ctx.db
        .query("sessions")
        .withIndex("leftAt", (q) =>
          q.eq("server", args.server).gte("leftAt", args.timestamp),
        )
        .filter((d) => d.not(d.eq("leftAt", undefined)))
        .collect(),
    ]);
    const events = [
      ...msgs.map((m) => ({
        ...m,
        type: "message" as const,
        timestamp: m.timestamp,
      })),
      ...joins.map((j) => {
        return { ...j, type: "join" as const, timestamp: j.joinedAt };
      }),
      ...leaves.map((l) => ({
        ...l,
        type: "leave" as const,
        timestamp: l.leftAt!,
      })),
    ];
    events.sort((a, b) => a.timestamp - b.timestamp);
    return events;
  },
});

