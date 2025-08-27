import { fetchQuery } from "convex/nextjs";
import { Role } from "discord.js";
import { z } from "zod";
import { api } from "../../../../../../convex/_generated/api";
import { Server } from "http";
import { Doc } from "../../../../../../convex/_generated/dataModel";
import { StringFormatParams } from "zod/v4/core";

const channelSchema = z.object({
  id: z.string(),
  type: z.number().int(),
  name: z.string(),
});

const userSchema = z.object({
  username: z.string(),
  id: z.string(),
});

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const messageSchema = z.object({
  content: z.string(),
  author: userSchema,
  channels: z.array(channelSchema),
  roles: z.array(roleSchema),
  mentions: z.array(userSchema),
});

export function discordToMinecraft({
  content,
  reply,
  author,
  users,
  mentions,
}: {
  content: string;
  reply?: {
    content: string;
    author: z.infer<typeof userSchema>;
  };
  author: z.infer<typeof userSchema>;
  users: Doc<"users">[];
  mentions: {
    users: z.infer<typeof userSchema>[];
    roles: z.infer<typeof roleSchema>[];
    channels: z.infer<typeof channelSchema>[];
  };
}) {
  const userRegex = new RegExp("<@(\d+)>");
  const roleRegex = new RegExp("<@&(\d+)>");
  const channelRegex = new RegExp("<#(\d+)>");

  content.replaceAll(
    userRegex,
    (id) =>
      users.find((user) => user.discord === id)?.minecraftName ?? `@${id}`,
  );
  content.replaceAll(
    roleRegex,
    (id) => `@${mentions.roles.find((u) => u.id === id)?.name ?? id}`,
  );
  content.replaceAll(
    channelRegex,
    (id) => `#${mentions.channels.find((u) => u.id === id)?.name ?? id}`,
  );

  const authorUser = users.find((user) => user.discord === author.id);

  const newMessage = `[Discord] ${authorUser?.minecraftName ?? author.username}: ${content}`;

  if (reply) {
    const replyUser = users.find((user) => user.discord === reply.author.id);
    const replyMessage = `[Discord] ${replyUser?.minecraftName ?? reply.author.username}: ${reply.content}`;
    return replyMessage + "\n↪ " + newMessage;
  }

  return newMessage;
}

export function minecraftToDiscord(content: string, users: Doc<"users">[]) {
  return content
    .split(" ")
    .map((word) => {
      const user = users.find((user) => user.minecraftName === word);
      if (user) {
        return `<@${user.discord}>`;
      }
      return word;
    })
    .join(" ");
}
