import { z } from "zod";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { minecraftToDiscord } from "../encoder";
import { newClient } from "~/server/discord/client";
import { Routes } from "discord.js";

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
    message: z.string(),
    fromUUID: z.string(),
    toUUID: z.optional(z.string()),
    timestamp: z.number(),
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

  const discord = minecraftToDiscord(data.message, allUsers);

  await fetchMutation(api.messages.createMessage, {
    from: profile._id,
    raw: data.message,
    minecraft: data.message,
    discord,
    loc: "minecraft",
    timestamp: data.timestamp,
    server: server._id,
  });

  const client = newClient(server);
  void client.post(Routes.channelMessages(server.messagesChannel), {
    body: {}
  })

  return Response.json({
    status: true,
    code: 0,
  });
}
