import express from "express";
import cors from "cors";
import salesRoutes from "./routes/salesRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { initSchema } from "./db/schema";
import db from "./db/connection";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Ensure schema exists even if the DB file was reset by the host
// (see Phase3_Architecture.md Section 1 — SQLite-on-ephemeral-hosting note)
initSchema(db);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", salesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sales Pulse API listening on port ${PORT}`);
});
