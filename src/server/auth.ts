import { fetchQuery } from "convex/nextjs"
import { api } from "../../convex/_generated/api"
import type { NextRequest } from "next/server";

export const getServerFromKey = async (apiKey: string) => {
  return await fetchQuery(api.server.getServerFromApiKey, { apiKey });
}

export const getServerFromRequest = async (
  req: NextRequest,
) => {
  const headers = req.headers;

  const apiKey = headers.get("x-api-key");
  if (!apiKey) {
    return null;
  }

  return await getServerFromKey(apiKey);
};

export const auth = getServerFromRequest