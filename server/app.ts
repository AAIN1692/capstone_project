import express, { Express } from "express";
import cors from "cors";
import salesRoutes from "./routes/salesRoutes";
import { errorHandler } from "./middleware/errorHandler";

/**
 * Builds the Express app without starting it or seeding the database.
 * Kept separate from server.ts so tests can import the app directly
 * (via supertest) without opening a real network port, and so tests
 * control seeding themselves rather than relying on boot-time seeding.
 */
export function createApp(): Express {
  const app = express();
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", salesRoutes);

  app.use(errorHandler);

  return app;
}