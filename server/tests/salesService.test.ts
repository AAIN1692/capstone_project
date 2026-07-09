import { describe, it, expect, beforeAll } from "vitest";
import db from "../db/connection";
import { initSchema } from "../db/schema";
import {
  getSummary,
  getTrend,
  getRepBreakdown,
  getCategoryBreakdown,
  getRegionBreakdown,
} from "../services/salesService";

/**
 * Deterministic fixture data (not the randomized seed script) so aggregation
 * math can be asserted exactly. Layout:
 *   Regions: West(1), East(2)
 *   Reps: Alice(1, West), Bob(2, East)
 *   Categories: Hardware(1), Software(2)
 *   Deals within Jan 2026: Alice $1000 (Hardware, Jan 5), Alice $2000 (Software, Jan 10),
 *                          Bob $500 (Hardware, Jan 15)
 *   Deal outside the test range: Bob $1500 (Software, Feb 1) — used to prove filtering works
 *   Quota targets for 2026-Q1: Alice $2500, Bob $1500
 */
beforeAll(() => {
  initSchema(db);
  db.exec(`DELETE FROM deals; DELETE FROM quota_targets; DELETE FROM reps; DELETE FROM product_categories; DELETE FROM regions;`);

  db.prepare("INSERT INTO regions (id, name) VALUES (1, 'West'), (2, 'East')").run();
  db.prepare("INSERT INTO reps (id, name, region_id) VALUES (1, 'Alice', 1), (2, 'Bob', 2)").run();
  db.prepare("INSERT INTO product_categories (id, name) VALUES (1, 'Hardware'), (2, 'Software')").run();

  const insertDeal = db.prepare(
    "INSERT INTO deals (rep_id, category_id, amount, closed_date, quota_period) VALUES (?, ?, ?, ?, ?)"
  );
  insertDeal.run(1, 1, 1000, "2026-01-05", "2026-Q1");
  insertDeal.run(1, 2, 2000, "2026-01-10", "2026-Q1");
  insertDeal.run(2, 1, 500, "2026-01-15", "2026-Q1");
  insertDeal.run(2, 2, 1500, "2026-02-01", "2026-Q1"); // outside the Jan test range

  const insertQuota = db.prepare("INSERT INTO quota_targets (rep_id, period, target_amount) VALUES (?, ?, ?)");
  insertQuota.run(1, "2026-Q1", 2500);
  insertQuota.run(2, "2026-Q1", 1500);
});

const JAN_RANGE = { startDate: "2026-01-01", endDate: "2026-01-31" };

describe("getSummary", () => {
  it("sums revenue and deal count only within the given date range", () => {
    const result = getSummary(JAN_RANGE);
    // Alice: 1000 + 2000, Bob: 500 (the Feb deal is excluded)
    expect(result.totalRevenue).toBe(3500);
    expect(result.dealsClosed).toBe(3);
  });

  it("computes average deal size correctly", () => {
    const result = getSummary(JAN_RANGE);
    expect(result.avgDealSize).toBeCloseTo(3500 / 3, 2);
  });

  it("computes quota attainment as revenue / sum of relevant targets", () => {
    const result = getSummary(JAN_RANGE);
    // Targets for 2026-Q1 (the only period with deals in range): 2500 + 1500 = 4000
    expect(result.quotaAttainmentPct).toBe(Math.round((3500 / 4000) * 100));
  });

  it("scopes correctly when filtered to a single rep", () => {
    const result = getSummary({ ...JAN_RANGE, repId: 1 });
    expect(result.totalRevenue).toBe(3000);
    expect(result.dealsClosed).toBe(2);
  });

  it("returns zeroed values, not an error, for a range with no data", () => {
    const result = getSummary({ startDate: "2020-01-01", endDate: "2020-01-02" });
    expect(result.totalRevenue).toBe(0);
    expect(result.dealsClosed).toBe(0);
    expect(result.quotaAttainmentPct).toBe(0);
  });
});

describe("getTrend", () => {
  it("returns one point per day at daily granularity, in chronological order", () => {
    const result = getTrend(JAN_RANGE, "daily");
    const dates = result.points.map((p) => p.period);
    expect(dates).toEqual(["2026-01-05", "2026-01-10", "2026-01-15"]);
  });

  it("aggregates revenue correctly at monthly granularity", () => {
    const result = getTrend(JAN_RANGE, "monthly");
    expect(result.points).toHaveLength(1);
    expect(result.points[0].revenue).toBe(3500);
  });
});

describe("getRepBreakdown", () => {
  it("sorts reps descending by revenue and excludes out-of-range deals", () => {
    const result = getRepBreakdown(JAN_RANGE);
    expect(result.items[0]).toMatchObject({ name: "Alice", revenue: 3000, dealsClosed: 2 });
    expect(result.items[1]).toMatchObject({ name: "Bob", revenue: 500, dealsClosed: 1 });
  });
});

describe("getCategoryBreakdown", () => {
  it("groups revenue by category within the range", () => {
    const result = getCategoryBreakdown(JAN_RANGE);
    const hardware = result.items.find((i) => i.name === "Hardware");
    const software = result.items.find((i) => i.name === "Software");
    // Hardware: Alice $1000 + Bob $500 = $1500; Software: Alice $2000 (Bob's Feb deal excluded)
    expect(hardware?.revenue).toBe(1500);
    expect(software?.revenue).toBe(2000);
  });
});

describe("getRegionBreakdown", () => {
  it("groups revenue by region within the range", () => {
    const result = getRegionBreakdown(JAN_RANGE);
    const west = result.items.find((i) => i.name === "West");
    const east = result.items.find((i) => i.name === "East");
    expect(west?.revenue).toBe(3000); // Alice
    expect(east?.revenue).toBe(500); // Bob, Jan only
  });
});