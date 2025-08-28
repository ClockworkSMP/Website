import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { GatewayIntentBits } from "discord.js";

function sum(l: number[]) {
  return l.reduce((a, b) => a + b, 0);
}

export async function GET(req: NextRequest) {
  const server = await auth(req);

  if (!server) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({
    TOKEN: server.botToken,
    INTENTS: sum([
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildExpressions,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildScheduledEvents,
      GatewayIntentBits.AutoModerationConfiguration,
      GatewayIntentBits.AutoModerationExecution,
      GatewayIntentBits.GuildMessagePolls,
      GatewayIntentBits.DirectMessagePolls
    ]),
  });
}