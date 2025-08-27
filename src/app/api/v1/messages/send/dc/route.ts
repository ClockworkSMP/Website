import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { BroadcastEvent } from "~/server/client";
import { discordToMinecraft, minecraftToDiscord, messageSchema } from "../encoder";


const Codes = {
  0: "Success",
  1: "Invalid permission",
  101: "Timedout",
  102: "Banned",
  2: "Invalid message",
  3: "Invalid timestamp",
  4: "Invalid fromUUID",
  5: "Error",
};

const channels = {
  0: "", // Guild text
  2: "", // Guild voice
  4: "", // Guild category
  5: "", // Guild announcement
  10: "", // Guild announcement thread
  11: "", // Guild public thread

  15: "" // Guild forum
}

export async function POST(req: NextRequest) {
  const server = await auth(req);
  if (!server) {
    return Response.json(
      {
        status: false,
      },
      {
        status: 401,
      },
    );
  }
  const schema = z.object({
    message: messageSchema,
    reply: z.optional(messageSchema),
    fromUUID: z.string(),
    timestamp: z.number(),
    discordId: z.string(),
  });

  const data = schema.parse(req.json());

  if (
    data.fromUUID &&
    !(await fetchQuery(api.users.isValidUser, { minecraft: data.fromUUID }))
  ) {
    return Response.json({
      status: false,
      reason: "Invalid fromUUID",
      code: 4,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  const user = await fetchQuery(api.users.queryUser, {
    minecraft: data.fromUUID,
  });

  if (!user) {
    return Response.json({
      status: false,
      reason: "User not found",
      code: 4,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  const profile = await fetchQuery(api.users.getProfile, {
    id: user._id,
    server: server._id,
  });

  if (!profile) {
    return Response.json({
      status: false,
      reason: "User not found",
      code: 4,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  if (profile.status === "banned") {
    return Response.json({
      status: false,
      reason: "Banned",
      code: 102,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  const timedout = await fetchQuery(api.moderation.isTimedout, {
    user: profile._id,
    server: server._id,
  });

  if (timedout) {
    return Response.json({
      status: false,
      reason: "Timedout",
      code: 101,
      data: {
        fromUUID: data.fromUUID,
      },
    });
  }

  const allProfiles = await fetchQuery(api.users.getserverProfiles, {
    server: server._id,
  });

  const allUsers = await fetchQuery(api.users.getBulkUsers, {
    profiles: allProfiles.map((u) => u._id),
  });

  const mcMessage = discordToMinecraft({
    content: data.message.content,
    users: allUsers,
    mentions: {
      users: data.message.mentions,
      roles: data.message.roles,
      channels: data.message.channels,
    },
    author: data.message.author,
    reply: data.reply ? {
      content: data.reply.content,
      author: data.reply.author,
    } : undefined
  });

  void fetchMutation(api.messages.createMessage, {
    from: profile._id,
    raw: data.message.content,
    discord: data.message.content,
    minecraft: mcMessage,
    loc: "discord",
    timestamp: data.timestamp,
    server: server._id,
    discordId: data.discordId,
  });

  void BroadcastEvent.message(mcMessage, false).send(server.serverIp, server.apiKey);

  return Response.json({
    status: true,
    code: 0,
  });
}