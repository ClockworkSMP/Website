import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    ips: v.array(v.string()),
    discord: v.union(v.string(), v.null()),
    minecraft: v.optional(v.string()),
    linkedAt: v.optional(v.number()),
  })
    .index("discord", ["discord"])
    .index("minecraft", ["minecraft"]),
  profile: defineTable({
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

    registeredAt: v.number(),
    whitelistedAt: v.optional(v.number()),
    bannedAt: v.optional(v.number()),
  })
    .index("server", ["server"])
    .index("status", ["status"])
    .index("serverUser", ["server", "user"]),

  moderationLog: defineTable({
    server: v.id("server"),

    user: v.id("profile"),
    moderator: v.id("profile"),
    action: v.union(
      v.literal("kick"),
      v.literal("ban"),
      v.literal("timeout"),
      v.literal("warn"),
    ),
    reason: v.optional(v.string()),
    timestamp: v.number(),
    expiresAt: v.optional(v.union(v.null(), v.number())),
    revokedAt: v.optional(v.number()),
  })
    .index("server", ["server"])
    .index("profile", ["server", "user"])
    .index("moderator", ["server", "moderator"])
    .index("timestamp", ["server", "timestamp"])
    .index("action", ["server", "action"])
    .index("revoked", ["server", "revokedAt"])
    .index("expires", ["server", "expiresAt"])
    .index("userActionRevokedExpires", [
      "server",
      "user",
      "action",
      "revokedAt",
      "expiresAt",
    ]),

  messages: defineTable({
    server: v.id("server"),

    from: v.id("profile"),
    message: v.string(),
    timestamp: v.number(),
    to: v.optional(v.id("profile")),
    moderation: v.optional(v.id("moderationLog")),
    loc: v.union(
      v.literal("discord"),
      v.literal("minecraft"),
      v.literal("console"),
    ),
  })
    .index("server", ["server"])
    .index("from", ["server", "from"])
    .index("users", ["server", "from", "to"])
    .index("moderation", ["server", "moderation"])
    .index("timestamp", ["server", "timestamp"])
    .index("loc", ["server", "loc"])
    .index("to", ["server", "to"]),

  sessions: defineTable({
    server: v.id("server"),
    user: v.id("profile"),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    ip: v.string(),
  })
    .index("server", ["server"])
    .index("user", ["server", "user"])
    .index("joinedAt", ["server", "joinedAt"])
    .index("leftAt", ["server", "leftAt"])
    .index("ip", ["server", "ip"])
    .index("ipUser", ["server", "ip", "user"])
    .index("userAndLeft", ["server", "user", "leftAt"]),

  whitelistAttempt: defineTable({
    server: v.id("server"),
    data: v.record(v.string(), v.any()),

    user: v.id("profile"),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("denied"),
    ),
    deniedReason: v.optional(v.string()),
    reapplyWhen: v.optional(v.number()),
    reviewedBy: v.optional(v.id("profile")),
  })
    .index("server", ["server"])
    .index("status", ["server", "status"])
    .index("reviewedBy", ["server", "reviewedBy"])
    .index("user", ["server", "user"]),

  health: defineTable({
    server: v.id("server"),
    tps: v.number(),
    online: v.number(),
    max: v.number(),
    players: v.array(v.id("profile")),
  })
    .index("server", ["server"])
    .index("tps", ["server", "tps"])
    .index("online", ["server", "online"]),

  config: defineTable({
    server: v.id("server"),
    activeWhitelist: v.boolean(),
    maintenanceMode: v.boolean(),
  }),

  server: defineTable({
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
    serverIp: v.string(),
    lockTo: v.optional(v.array(v.string())),

    disableElytra: v.array(
      v.union(v.literal("end"), v.literal("overworld"), v.literal("nether")),
    ),
    disableDimension: v.array(
      v.union(v.literal("end"), v.literal("overworld"), v.literal("nether")),
    ),

    tpaRank: v.union(
      v.literal("admin"),
      v.literal("mod"),
      v.literal("helper"),
      v.literal("whitelisted"),
    ),
  })
    .index("name", ["name"])
    .index("apiKey", ["apiKey"])
    .index("discordGuild", ["discordGuild"])
    .index("botToken", ["botToken"]),

  tpa: defineTable({
    server: v.id("server"),
    from: v.id("profile"),
    to: v.id("profile"),
    status: v.union(
      v.literal("accepted"),
      v.literal("denied"),
      v.literal("pending"),
    ),
    chosenAt: v.optional(v.number()),
  })
    .index("server", ["server"])
    .index("status", ["server", "status"])
    .index("to", ["server", "to"])
    .index("userStatus", ["server", "to", "status"]),
});
