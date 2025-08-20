import { Router } from "express";

import { router as session } from "./sessions";

export const router = Router();

router.use("/sessions", session);