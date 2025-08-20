import { Router } from "express";
import { router as killRouter } from "./routes/kill";

export const router = Router();

router.use(killRouter);