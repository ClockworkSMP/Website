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
    if (!server.activeWhitelist) {
      return Response.json({
        status: true,
        code: 0,
      });
    }

    const data = schema.parse(await req.json());

    // Additional validation to ensure username is not empty
    if (!data.username || data.username.trim() === "") {
      KickEvent.withReason("Invalid username").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "Invalid username",
        code: 1,
        data: {
          username: data.username,
        },
      });
    }

    console.log("Checking if user is valid:", data.username);

    const isValid = await fetchQuery(api.users.isValidUser, {
      minecraft: data.username,
    });

    console.log("isValid result:", isValid);

    if (!isValid) {
      KickEvent.withReason("Not whitelisted").send(
        server.serverIp,
        server.apiKey,
      );
      return Response.json({
        status: false,
        reason: "Not Whitelisted",
        code: 201,
        data: {
          username: data.username,
        },
      });
    }

    const user = await fetchQuery(api.users.queryUser, {
      minecraft: data.username,
    });

    if (!user) {
      KickEvent.withReason("User not found").send(
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

    if (user.status === "banned") {
      KickEvent.withReason("You are banned").send(
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

    // Check if banned lists exist before using them
    if (
      env.BANNED_DISCORDS &&
      user.discord &&
      user.discord in env.BANNED_DISCORDS
    ) {
      KickEvent.withReason("201").send(server.serverIp, server.apiKey);

      return Response.json({
        status: false,
        reason: "",
        code: 201,
        data: {
          username: data.username,
        },
      });
    }

    if (env.BANNED_MINECRAFT && user.minecraft in env.BANNED_MINECRAFT) {
      return Response.json({
        status: false,
        reason: "",
        code: 202,
        data: {
          username: data.username,
        },
      });
    }

    if (server.lockTo && !server.lockTo.includes(profile.status)) {
        KickEvent.withReason("Currently in maintenance mode").send(
          server.serverIp,
          server.apiKey,
        );

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
      id: user._id,
    });

    if (duplicateIp) {
      KickEvent.withReason("Duplicate IPs").send(
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
      user: user._id,
      joinedAt: data.timestamp,
      ip: data.ip,
    });

    return Response.json({
      status: true,
      code: 0,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      KickEvent.withReason("Internal server error").send(
        server.serverIp,
        server.apiKey,
      );
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
    KickEvent.withReason("Internal server error").send(
      server.serverIp,
      server.apiKey,
    );
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
