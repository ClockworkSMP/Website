import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { convex } from "../../../convex";
import { Response, Router } from "express";

export const router = Router();

router.get("/", async (req, res) => {
  async function checkConvex() {
    return await convex.query(api.messages.fetchLatest, {});
  }

	function sendMessage(res: Response, msg: Doc<"messages"> | Doc<"sessions">) {
    res.write(JSON.stringify(msg));
  }
  
  async function poll(res: Response) {
    const msgs = await checkConvex();
    msgs.forEach((msg) => sendMessage(res, msg));
  }

  setInterval(poll, 200, res)
  await poll(res);
});
