import type Database from "better-sqlite3";

/**
 * Creates all Sales Pulse tables if they do not already exist.
 * Matches the data model in Phase3_Architecture.md Section 3.
 */
export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS reps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region_id INTEGER NOT NULL,
      FOREIGN KEY (region_id) REFERENCES regions(id)
    );

    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rep_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      closed_date TEXT NOT NULL, -- ISO date, e.g. 2026-04-12
      quota_period TEXT NOT NULL, -- e.g. 2026-Q2
      FOREIGN KEY (rep_id) REFERENCES reps(id),
      FOREIGN KEY (category_id) REFERENCES product_categories(id)
    );

    CREATE TABLE IF NOT EXISTS quota_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rep_id INTEGER NOT NULL,
      period TEXT NOT NULL, -- matches quota_period, e.g. 2026-Q2
      target_amount REAL NOT NULL,
      FOREIGN KEY (rep_id) REFERENCES reps(id)
    );

    CREATE INDEX IF NOT EXISTS idx_deals_closed_date ON deals(closed_date);
    CREATE INDEX IF NOT EXISTS idx_deals_rep_id ON deals(rep_id);
    CREATE INDEX IF NOT EXISTS idx_deals_category_id ON deals(category_id);
  `);
}