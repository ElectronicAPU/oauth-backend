import type { NextFunction, Request, Response } from "express";
import express from "express"
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  next();
});

app.use("/api/v1/users", authRoutes);

app.get("/", async (req, res) => {
  res.send("API is working!");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === "entity.parse.failed")
    return res.status(400).json({success: false, message: "Invalid JSON body."})

  console.error(err.stack);
  res.status(500).json({success: false, message: "Something went wrong!"})
});

app.listen(PORT, () => {
  console.log(`Server listen on http://localhost:${PORT}`);
});
