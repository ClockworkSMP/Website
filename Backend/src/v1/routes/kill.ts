import { Router } from "express";
import { Response } from "express";
// import { success } from "../../util/response";

export function success(res: Response, data: Record<any, any>) {
  res.status(200).json({
    status: true,
    data
  });
}

export function error(res: Response, reason: string, data: Record<any, any>, kill: boolean = false) {
  res.status(400).json({
    status: false,
    reason,
    kill,
    data
  });
}

export const router = Router();

/*
Status:
- 200: Work

Response:

{
  status: true,
  version: int,
} : work

{
  status: false,
  reason: string,
  action: kick | ban | nuke | throw,
  public: boolean,
  version: int,
}
*/

router.get("/server", (req, res) => {
  success(res, {});
});

router.get("/client", (req, res) => {
  success(res, {});
});

router.get("/cosmetics", (req, res) => {
	success(res, {});
});