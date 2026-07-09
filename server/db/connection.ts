import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "sales_pulse.db");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export default db;