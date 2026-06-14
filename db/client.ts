import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { ensureDataDir } from "@/lib/db-path";

ensureDataDir();
const sqlite = new Database(process.env.DATABASE_URL ?? "./data/app.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// 自动迁移：确保 chef 列存在
try { sqlite.exec("ALTER TABLE recipes ADD COLUMN chef TEXT"); } catch { /* column already exists */ }

export const drizzleDb = drizzle(sqlite, { schema });
export const db = sqlite;
export { sqlite };
