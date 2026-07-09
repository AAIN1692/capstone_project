import express from "express";
import cors from "cors";
import salesRoutes from "./routes/salesRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { seedIfEmpty } from "./db/seed";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Ensure schema exists AND data is present even if the DB file was reset
// by the host on redeploy (see Phase3_Architecture.md Section 1/6 —
// SQLite-on-ephemeral-hosting risk). Safe to call on every boot: it's a
// no-op if deals already exist.
seedIfEmpty();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", salesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sales Pulse API listening on port ${PORT}`);
});