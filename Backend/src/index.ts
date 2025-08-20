import express from "express";
import { router as v1} from "./v1";
import { authMiddleware } from "./util/auth";


export const app = express();
const port = 3000;

app.use(authMiddleware);
app.use(express.json());
app.use("/api/v1", v1);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

