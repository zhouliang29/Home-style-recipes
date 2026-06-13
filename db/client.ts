import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { ensureDataDir } from "@/lib/db-path";

ensureDataDir();
const sqlite = new Database(process.env.DATABASE_URL ?? "./data/app.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const drizzleDb = drizzle(sqlite, { schema });
export const db = sqlite;
export { sqlite };
