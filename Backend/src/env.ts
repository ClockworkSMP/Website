import { z } from "zod";

const envSchema = z.object({
  convex_url: z.string(),
  banned_discords: z.preprocess((val) => {
    if (!(typeof val === "string")) {
      return val;
    }
    return val.split(",");
  }, z.array(z.string())),
  banned_minecraft: z.preprocess((val) => {
    if (!(typeof val === "string")) {
      return val;
    }
    return val.split(",");
  }, z.array(z.string())),
  auth_token: z.string(),
});

export default envSchema.parse(process.env);