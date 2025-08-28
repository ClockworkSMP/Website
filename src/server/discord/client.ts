import { REST } from "discord.js";
import type { DiscordMessage } from "./types";
import type { Doc } from "../../../convex/_generated/dataModel";

export function newClient(server: Doc<"server">) {
  return new REST({ version: "10" }).setToken(server.botToken);
}

export const onMessage = async (
  rest: REST,
  server: Doc<"server">,
  message: DiscordMessage,
) => {
  return;
};
