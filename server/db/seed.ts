import db from "./connection";
import { initSchema } from "./schema";

/**
 * Seeds ~6 months of realistic sales transactions.
 * Deliberately encodes three patterns so the dashboard has something
 * genuine to reveal (see Idea Brief Risk 1 / Architecture Risk 2):
 *   1. "Star performer" rep running well above the team average
 *   2. One region trending down over the final 6 weeks of the window
 *   3. A seasonal dip in a single month (e.g. a slow holiday month)
 */

const REGIONS = ["West", "East", "Central", "North"];
const CATEGORIES = ["Hardware", "Software Licenses", "Support Plans", "Professional Services", "Add-ons"];
const REPS = [
  { name: "Alex Chen", region: "West" },
  { name: "Priya Nair", region: "West" },
  { name: "Jordan Blake", region: "East" },
  { name: "Sam Rivera", region: "East" },
  { name: "Morgan Lee", region: "Central" },
  { name: "Taylor Kim", region: "Central" },
  { name: "Casey Wright", region: "North" },
  { name: "Drew Sullivan", region: "North" },
];

const STAR_PERFORMER = "Alex Chen";
const SLUMPING_REGION = "North";
const DIP_MONTH_INDEX = 4; // 0-indexed month within the 6-month window (a slow month)

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function quotaPeriodFor(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

function seed() {
  initSchema(db);

  // Clear existing data so seed is idempotent
  db.exec(`DELETE FROM deals; DELETE FROM quota_targets; DELETE FROM reps; DELETE FROM product_categories; DELETE FROM regions;`);

  const insertRegion = db.prepare("INSERT INTO regions (name) VALUES (?)");
  const regionIds: Record<string, number> = {};
  for (const r of REGIONS) {
    const info = insertRegion.run(r);
    regionIds[r] = info.lastInsertRowid as number;
  }

  const insertCategory = db.prepare("INSERT INTO product_categories (name) VALUES (?)");
  const categoryIds: number[] = [];
  for (const c of CATEGORIES) {
    const info = insertCategory.run(c);
    categoryIds.push(info.lastInsertRowid as number);
  }

  const insertRep = db.prepare("INSERT INTO reps (name, region_id) VALUES (?, ?)");
  const repRecords: { id: number; name: string; region: string }[] = [];
  for (const r of REPS) {
    const info = insertRep.run(r.name, regionIds[r.region]);
    repRecords.push({ id: info.lastInsertRowid as number, name: r.name, region: r.region });
  }

  const insertDeal = db.prepare(
    `INSERT INTO deals (rep_id, category_id, amount, closed_date, quota_period) VALUES (?, ?, ?, ?, ?)`
  );

  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 6);

  let totalDeals = 0;
  let totalRevenue = 0;

  // Walk day by day across the 6-month window
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const monthsFromStart = (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth());
    const isDipMonth = monthsFromStart === DIP_MONTH_INDEX;
    const weeksFromToday = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7);
    const inSlumpWindow = weeksFromToday <= 6;

    for (const rep of repRecords) {
      // Base probability a rep closes a deal on a given day
      let dailyChance = 0.35;

      if (rep.name === STAR_PERFORMER) dailyChance = 0.55;
      if (isDipMonth) dailyChance *= 0.5;
      if (rep.region === SLUMPING_REGION && inSlumpWindow) dailyChance *= 0.4;

      if (Math.random() < dailyChance) {
        const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
        let amount = randomBetween(500, 8000);
        if (rep.name === STAR_PERFORMER) amount *= 1.8;
        if (isDipMonth) amount *= 0.85;
        if (rep.region === SLUMPING_REGION && inSlumpWindow) amount *= 0.7;

        amount = Math.round(amount * 100) / 100;
        const dateStr = isoDate(d);
        insertDeal.run(rep.id, categoryId, amount, dateStr, quotaPeriodFor(d));
        totalDeals += 1;
        totalRevenue += amount;
      }
    }
  }

  // Seed quota targets per rep per quarter covering the window
  const insertQuota = db.prepare(
    `INSERT INTO quota_targets (rep_id, period, target_amount) VALUES (?, ?, ?)`
  );
  const periodsSeen = new Set<string>();
  for (let d = new Date(start); d <= today; d.setMonth(d.getMonth() + 1)) {
    periodsSeen.add(quotaPeriodFor(d));
  }
  for (const rep of repRecords) {
    for (const period of periodsSeen) {
      const baseTarget = rep.name === STAR_PERFORMER ? 45000 : 28000;
      insertQuota.run(rep.id, period, baseTarget);
    }
  }

  console.log(`Seed complete: ${totalDeals} deals inserted, $${totalRevenue.toFixed(2)} total revenue.`);
  console.log(`Patterns seeded: star performer = ${STAR_PERFORMER}, slumping region = ${SLUMPING_REGION}, dip month index = ${DIP_MONTH_INDEX}`);
}

seed();
