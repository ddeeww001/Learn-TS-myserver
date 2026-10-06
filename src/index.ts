import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "node:path";
import userRouter from "./UserRoutes.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI;
const clientOrigin = process.env.CLIENT_ORIGIN ?? `http://localhost:${port}`;

app.use(express.json({ limit: "10kb" }));
app.use(cors({ origin: clientOrigin }));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/health", (_req: Request, res: Response) => {
  res.send("OK");
});


app.use("/api", userRouter);

if (!mongoUri) {
  console.error("MONGODB_URI is not set. Create a .env file first.");
  process.exitCode = 1;
} else {
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("Connected to MongoDB");

      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
      process.exitCode = 1;
    });
}
