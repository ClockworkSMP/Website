import env from "../env";

export function authMiddleware(req, res, next) {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(" ");
    if (type === "Bearer" && token === env.auth_token) {
      return next();
    }
  }

  res.status(401).json({
    status: false,
    reason: "Unauthorized",
    data: {}
  });
  
  // res.status(401).json({
  //   status: false,
  //   reason: "Unauthorized",
  //   kill: true,
  //   data: {}
  // });
}