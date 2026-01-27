import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAnalyze, uploadMiddleware } from "./routes/analyze";
import { handleGetAnalysis, handleChat } from "./routes/analysis";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Resume screening routes
  app.post("/api/analyze", uploadMiddleware, handleAnalyze);
  app.get("/api/analysis/:id", handleGetAnalysis);
  app.post("/api/chat/:id", handleChat);

  return app;
}
