import { Router } from "express";

import { router as sendRouter } from "./send";
import { router as streamRouter } from "./stream";

export const router = Router();

router.use("/send", sendRouter);
router.use("/stream", streamRouter);