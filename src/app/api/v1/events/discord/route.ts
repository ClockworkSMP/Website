import type { NextRequest } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";

export async function GET(req: NextRequest) {
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

  const resp = await fetch(`${env.REDIS_URL}/subscribe/${server._id}`, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${env.REDIS_TOKEN}`,
    },
  });

  if (resp.body === null) {
    return Response.json(
      {
        status: false,
      },
      {
        status: 401,
      },
    );
  }

  function processData(data: string) {
    const splitData = data.split(",", 3);
    if (splitData[0] !== "message") {
      return null;
    }

    return splitData[2];
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[BOT] Stream closed");
          controller.close();
          break;
        }
        const processedData = processData(decoder.decode(value));
        if (processedData === null) {
          continue;
        }

        controller.enqueue(encoder.encode(processedData));
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
