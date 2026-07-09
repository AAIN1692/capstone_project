import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import db from "../db/connection";
import { initSchema } from "../db/schema";

const app = createApp();

beforeAll(() => {
  initSchema(db);
  db.exec(`DELETE FROM deals; DELETE FROM quota_targets; DELETE FROM reps; DELETE FROM product_categories; DELETE FROM regions;`);

  db.prepare("INSERT INTO regions (id, name) VALUES (1, 'West')").run();
  db.prepare("INSERT INTO reps (id, name, region_id) VALUES (1, 'Alice', 1)").run();
  db.prepare("INSERT INTO product_categories (id, name) VALUES (1, 'Hardware')").run();
  db.prepare(
    "INSERT INTO deals (rep_id, category_id, amount, closed_date, quota_period) VALUES (1, 1, 1200, '2026-03-10', '2026-Q1')"
  ).run();
  db.prepare("INSERT INTO quota_targets (rep_id, period, target_amount) VALUES (1, '2026-Q1', 2000)").run();
});

describe("GET /api/health", () => {
  it("returns a 200 status ok response", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/summary", () => {
  it("returns real aggregated data for a valid date range", async () => {
    const res = await request(app).get("/api/summary?startDate=2026-03-01&endDate=2026-03-31");
    expect(res.status).toBe(200);
    expect(res.body.totalRevenue).toBe(1200);
    expect(res.body.dealsClosed).toBe(1);
  });

  it("returns a 400 with a plain-language error when dates are missing", async () => {
    const res = await request(app).get("/api/summary");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/startDate and endDate are required/i);
    // Explicitly guard against a stack trace or technical jargon leaking to the client
    expect(res.body.error).not.toMatch(/at Object|node_modules|Error:/);
  });

  it("returns a 400 when startDate is after endDate", async () => {
    const res = await request(app).get("/api/summary?startDate=2026-05-01&endDate=2026-01-01");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/startDate must be before/i);
  });
});

describe("GET /api/trend", () => {
  it("returns trend points at the requested granularity", async () => {
    const res = await request(app).get("/api/trend?startDate=2026-03-01&endDate=2026-03-31&granularity=daily");
    expect(res.status).toBe(200);
    expect(res.body.granularity).toBe("daily");
    expect(res.body.points).toEqual([{ period: "2026-03-10", revenue: 1200 }]);
  });

  it("returns a 400 for an invalid granularity value", async () => {
    const res = await request(app).get("/api/trend?startDate=2026-03-01&endDate=2026-03-31&granularity=yearly");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/granularity must be one of/i);
  });
});

describe("GET /api/breakdown/reps", () => {
  it("returns rep-level breakdown for the range", async () => {
    const res = await request(app).get("/api/breakdown/reps?startDate=2026-03-01&endDate=2026-03-31");
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ id: 1, name: "Alice", revenue: 1200, dealsClosed: 1 }]);
  });

  it("returns an empty items array (not an error) for a range with no data", async () => {
    const res = await request(app).get("/api/breakdown/reps?startDate=2020-01-01&endDate=2020-01-02");
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });
});

describe("GET /api/filters/options", () => {
  it("returns available reps, categories, and regions", async () => {
    const res = await request(app).get("/api/filters/options");
    expect(res.status).toBe(200);
    expect(res.body.reps).toEqual([{ id: 1, name: "Alice" }]);
    expect(res.body.categories).toEqual([{ id: 1, name: "Hardware" }]);
    expect(res.body.regions).toEqual([{ id: 1, name: "West" }]);
  });
});