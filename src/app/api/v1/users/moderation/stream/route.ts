import { api } from "../../../../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import EventEmitter from "events";

const dataEmitter = new EventEmitter();

let lastTimestamp = 0;
setInterval(async () => {
  const data = await fetchQuery(api.moderation.fetchLatest, {
    timestamp: lastTimestamp,
  });
  lastTimestamp = Date.now();
  dataEmitter.emit("data", data);
}, 1000);

export async function GET() {
  const encoder = new TextEncoder();

  // Get search params for filtering/configuration
  const stream = new ReadableStream({
    start(controller) {
      console.log("Stream started");

      // Send initial message
      const initialData = {
        status: true,
        timestamp: Date.now(),
      };
      controller.enqueue(
        encoder.encode("c: " + JSON.stringify(initialData) + "\n"),
      );

      // Listen for external data
      const msgHandler = (data) => {
        try {
          controller.enqueue(
            encoder.encode("m: " + JSON.stringify(data) + "\n"),
          );
        } catch (error) {
          console.error("Error sending data:", error);
          controller.error(error);
        }
      };

      const joinHandler = (data) => {
        try {
          controller.enqueue(
            encoder.encode("j: " + JSON.stringify(data) + "\n"),
          );
        } catch (error) {
          console.error("Error sending data:", error);
          controller.error(error);
        }
      };

      const leaveHandler = (data) => {
        try {
          controller.enqueue(
            encoder.encode("l: " + JSON.stringify(data) + "\n"),
          );
        } catch (error) {
          console.error("Error sending data:", error);
          controller.error(error);
        }
      };

      const dataHandler = (data: DATA[]) => {
        data.forEach((event) => {
          if (event.type === "message") {
            msgHandler(data);
          }
          if (event.type === "join") {
            joinHandler(data);
          }
          if (event.type === "leave") {
            leaveHandler(data);
          }
        });
      };

      dataEmitter.on("data", dataHandler);
    },

    cancel() {
      console.log("Stream cancelled");
    },
  });

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  return new Response(stream, { headers });
}
