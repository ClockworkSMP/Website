import { z } from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { env } from "~/env";
import type { NextRequest } from "next/server";

const CODES = {
  0: "Success",
  1: "Invalid username",
  200: "Banned",
  201: "Banned username",
  202: "Banned discord",

  3: "Invalid timestamp",
  4: "Error",
};

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      username: z.string().min(1, "Username cannot be empty"),
      timestamp: z.number(),
    });
    const data = schema.parse(await req.json());

    // Additional validation to ensure username is not empty
    if (!data.username || data.username.trim() === "") {
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
      return Response.json({
        status: false,
        reason: "Invalid username",
        code: 1,
        data: {
          username: data.username,
        },
      });
    }

    const user = await fetchQuery(api.users.queryUser, {
      minecraft: data.username,
    });

    if (!user) {
      return Response.json({
        status: false,
        reason: "User not found",
        code: 4,
        data: {
          username: data.username,
        },
      });
    }

    // Check if banned lists exist before using them
    if (env.BANNED_DISCORDS && user.discord in env.BANNED_DISCORDS) {
      return Response.json({
        status: false,
        reason: "Banned discord",
        code: 201,
        data: {
          username: data.username,
        },
      });
    }

    if (env.BANNED_MINECRAFT && user.minecraft in env.BANNED_MINECRAFT) {
      return Response.json({
        status: false,
        reason: "Banned minecraft",
        code: 202,
        data: {
          username: data.username,
        },
      });
    }

    await fetchMutation(api.sessions.createSession, {
      user: user._id,
      joinedAt: data.timestamp,
    });

    return Response.json({
      status: true,
    });
  } catch (error) {
    console.error("Error in join route:", error);
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
