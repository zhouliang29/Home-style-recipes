import fs from "node:fs";
import path from "node:path";

export function ensureDataDir() {
  const dbPath = process.env.DATABASE_URL ?? "./data/app.db";
  const dir = path.dirname(dbPath);
  if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
}
