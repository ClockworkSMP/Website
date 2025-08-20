import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    discord: v.union(v.string(), v.null()),
    minecraft: v.string(),
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
    .index("discord", ["discord"])
    .index("minecraft", ["minecraft"])
    .index("status", ["status"]),
  moderationLog: defineTable({
    user: v.id("users"),
    moderator: v.id("users"),
    action: v.union(
      v.literal("kick"),
      v.literal("ban"),
      v.literal("timeout"),
      v.literal("warn"),
    ),
    reason: v.union(v.string(), v.null()),
    timestamp: v.number(),
    expiresAt: v.optional(v.union(v.null(), v.number())),
    revokedAt: v.optional(v.number()),
  })
    .index("user", ["user"])
    .index("moderator", ["moderator"])
    .index("timestamp", ["timestamp"])
    .index("action", ["action"])
    .index("revoked", ["revokedAt"])
    .index("expires", ["expiresAt"])
    .index("userActionRevokedExpires", [
      "user",
      "action",
      "revokedAt",
      "expiresAt",
    ]),
  messages: defineTable({
    from: v.id("users"),
    message: v.string(),
    timestamp: v.number(),
    to: v.optional(v.id("users")),
    moderation: v.optional(v.id("moderationLog")),
    loc: v.union(
      v.literal("discord"),
      v.literal("minecraft"),
      v.literal("console"),
    ),
  })
    .index("from", ["from"])
    .index("users", ["from", "to"])
    .index("moderation", ["moderation"])
    .index("timestamp", ["timestamp"])
    .index("loc", ["loc"])
    .index("to", ["to"]),
  sessions: defineTable({
    user: v.id("users"),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
  })
    .index("user", ["user"])
    .index("joinedAt", ["joinedAt"])
    .index("leftAt", ["leftAt"])
    .index("userAndLeft", ["user", "leftAt"]),
  whitelistAttempt: defineTable({
    discord: v.string(),
    minecraft: v.string(),
    age: v.number(),
    found: v.string(),
    interests: v.string(),
    otherSMP: v.boolean(),
    create: v.boolean(),
    goodAt: v.string(),
    town: v.union(v.literal("myOwn"), v.literal("other"), v.literal("none")),
    friends: v.id("users"),
    otherInfo: v.string(),

    user: v.id("users"),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("denied"),
    ),
    deniedReason: v.optional(v.string()),
    reapplyWhen: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
  })
    .index("discord", ["discord"])
    .index("status", ["status"])
    .index("reviewedBy", ["reviewedBy"])
    .index("user", ["user"]),
});
