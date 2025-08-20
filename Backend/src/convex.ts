import { ConvexHttpClient } from "convex/browser";
import env from "./env";

export const convex = new ConvexHttpClient(env.convex_url);