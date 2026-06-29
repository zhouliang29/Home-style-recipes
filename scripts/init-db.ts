import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_URL ?? "./data/app.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  avatar_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category_id TEXT REFERENCES categories(id),
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  tips TEXT,
  chef TEXT,
  created_by_id TEXT NOT NULL REFERENCES users(id),
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE TABLE IF NOT EXISTS recipe_tags (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, tag_id)
);
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT,
  "group" TEXT NOT NULL DEFAULT 'main' CHECK ("group" IN ('main','seasoning')),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS recipe_steps (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT
);
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  UNIQUE(user_id, recipe_id)
);
CREATE TABLE IF NOT EXISTS cooking_logs (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cooked_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  note TEXT
);
CREATE TABLE IF NOT EXISTS weekly_menus (
  id TEXT PRIMARY KEY,
  week_start_date INTEGER NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE TABLE IF NOT EXISTS weekly_menu_items (
  id TEXT PRIMARY KEY,
  weekly_menu_id TEXT NOT NULL REFERENCES weekly_menus(id) ON DELETE CASCADE,
  recipe_id TEXT REFERENCES recipes(id) ON DELETE SET NULL,
  custom_text TEXT,
  date INTEGER NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner')),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','weekly_menu')),
  created_by_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id TEXT PRIMARY KEY,
  shopping_list_id TEXT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT,
  category TEXT,
  checked INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_recipes_active_updated ON recipes(is_archived, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_steps_recipe ON recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON weekly_menu_items(weekly_menu_id);
CREATE TABLE IF NOT EXISTS meal_orders (
  id TEXT PRIMARY KEY,
  total_count INTEGER NOT NULL DEFAULT 0,
  created_by_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE TABLE IF NOT EXISTS meal_order_items (
  id TEXT PRIMARY KEY,
  meal_order_id TEXT NOT NULL REFERENCES meal_orders(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_title TEXT NOT NULL,
  cover_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_shopping_items_list ON shopping_list_items(shopping_list_id);
`);

console.log(`Database initialized at ${dbPath}`);

// 种子数据：分类
const existingCats = db.prepare("SELECT COUNT(*) as cnt FROM categories").get() as { cnt: number };
if (existingCats.cnt === 0) {
  const insertCat = db.prepare("INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)");
  const seedCategories = [
    { id: "zhouliang", name: "周良", icon: "👨‍🍳", sortOrder: 0 },
    { id: "zhangxing", name: "张幸", icon: "👩‍🍳", sortOrder: 1 },
  ];
  for (const c of seedCategories) insertCat.run(c.id, c.name, c.icon, c.sortOrder);
  console.log("Seed categories inserted");
}
