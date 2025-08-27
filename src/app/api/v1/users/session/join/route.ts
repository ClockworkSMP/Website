import { z } from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { env } from "~/env";
import type { NextRequest } from "next/server";
import { KickEvent } from "~/server/client";
import { auth } from "~/server/auth";

const CODES = {
  0: "Success",
  1: "Invalid username",

  200: "Banned",
  201: "Not Authorized",
  2011: "Not Whitelisted",
  2012: "Maintenance Mode",
  2013: "Duplicate IP",

  202: "Banned username",
  203: "Banned discord",

  3: "Invalid timestamp",
  4: "Error",
  5: "Banned",
};

export async function POST(req: NextRequest) {
  const server = await auth(req);

  try {
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
      username: z.string().min(1, "Username cannot be empty"),
      timestamp: z.number(),
      ip: z.string(),
    });

    const data = schema.parse(await req.json());

    const user = await fetchQuery(api.users.queryUser, {
      minecraft: data.username,
    });

    if (!user) {
      await KickEvent.withReason("User not found").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "User not found",
        code: 4,
        data: {
          username: data.username,
        },
      });
    }

    if (!user.minecraftUUID) {
      void KickEvent.withReason(data.username, "User not created").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "User not found",
        code: 4,
        data: {
          username: data.username,
        },
      });
    }

    const profile = await fetchQuery(api.users.getProfile, {
      server: server._id,
      id: user._id,
    });

    if (!profile) {
      void KickEvent.withReason("User not found").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "User not found",
        code: 4,
        data: {
          username: data.username,
        },
      });
    }

    if (profile.status === "banned") {
      await KickEvent.withReason(user.minecraftUUID, "You are banned").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "Banned",
        code: 5,
        data: {
          username: data.username,
        },
      });
    }

    if (server.lockTo && !server.lockTo.includes(profile.status)) {
      await KickEvent.withReason(
        user.minecraftUUID,
        "Currently in maintenance mode",
      ).send(server.serverIp, server.apiKey);

      return Response.json({
        status: false,
        reason: "Maintenance mode",
        code: 203,
        data: {
          username: data.username,
        },
      });
    }

    const duplicateIp = await fetchQuery(api.sessions.checkIp, {
      ip: data.ip,
      server: server._id,
      id: profile._id,
    });

    if (duplicateIp) {
      await KickEvent.withReason(user.minecraftUUID, "Duplicate IPs").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "Duplicate IP",
        code: 2013,
        data: {
          username: data.username,
        },
      });
    }

    await fetchMutation(api.sessions.createSession, {
      user: profile._id,
      joinedAt: data.timestamp,
      server: server._id,
      ip: data.ip,
    });

    // Check if banned lists exist before using them
    if (
      env.BANNED_DISCORDS &&
      user.discord &&
      user.discord in env.BANNED_DISCORDS
    ) {
      await KickEvent.withReason(user.minecraftUUID, "201").send(
        server.serverIp,
        server.apiKey,
      );

      return Response.json({
        status: false,
        reason: "",
        code: 201,
        data: {
          username: data.username,
        },
      });
    }

    if (
      env.BANNED_MINECRAFT &&
      user.minecraftUUID &&
      user.minecraftUUID in env.BANNED_MINECRAFT
    ) {
      await KickEvent.withReason(user.minecraftUUID, "201").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "",
        code: 202,
        data: {
          username: data.username,
        },
      });
    }

    return Response.json({
      status: true,
      code: 0,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      return Response.json(
        {
          status: false,
          reason: "Internal server error",
          code: 4,
          data: {},
        },
        { status: 500 },
      );
    }
    console.error("Error in join route: ", error);

    return Response.json(
      {
        status: false,
        reason: "Internal server error",
        code: 4,
        data: {
          error: error.message,
        },
      },
      { status: 500 },
    );
  }
}
