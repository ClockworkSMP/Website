import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: {
    user: v.id("profile"),
    joinedAt: v.optional(v.number()),
    ip: v.string(),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.user);
    if (!profile) {
      return;
    }
    const user = await ctx.db.get(profile.user);
    if (!user) {
      return;
    }
await Promise.all([ctx.db.insert("sessions", {
  server: args.server,
  user: args.user,
  joinedAt: args.joinedAt ?? Date.now(),
  ip: args.ip,
}), ctx.db.patch(profile.user, {
  ips: user.ips.concat(args.ip),
})]);

    return 
  },
});

export const endSession = mutation({
  args: {
    user: v.id("profile"),
    leftAt: v.optional(v.number()),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("userAndLeft", (q) =>
        q
          .eq("server", args.server)
          .eq("user", args.user)
          .eq("leftAt", args.leftAt),
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
    user: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("user", (q) =>
        q.eq("server", args.server).eq("user", args.user),
      )
      .collect();
  },
});

export const getLastSession = query({
  args: {
    user: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("userAndLeft", (q) =>
        q.eq("server", args.server).eq("user", args.user),
      )
      .order("desc")
      .first();
  },
});

export const checkIp = query({
  args: {
    ip: v.string(),
    id: v.id("profile"),
    server: v.id("server"),
  },
  handler: async (ctx, args) => {
    return (
      (
        await ctx.db
          .query("sessions")
          .withIndex("ip", (q) => q.eq("server", args.server).eq("ip", args.ip))
          .filter((q) => q.not(q.eq(q.field("user"), args.id)))
          .collect()
      ).length > 0
    );
  },
});
