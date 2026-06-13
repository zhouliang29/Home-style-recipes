import "./init-db";
import { randomUUID } from "node:crypto";
import { db } from "../db/client";
import { hashPassword } from "../lib/password";

const categories = ["家常菜", "汤", "早餐", "主食", "凉菜", "甜品", "烘焙", "饮品", "儿童餐", "减脂餐"];

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(2, 12);
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!existing) {
    db.prepare("INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, 'admin')").run(
      randomUUID(),
      "管理员",
      username,
      await hashPassword(password),
    );
    console.log(`Created admin user: ${username}`);
    if (!process.env.ADMIN_PASSWORD) console.log(`Generated admin password: ${password}`);
  } else {
    console.log(`Admin user already exists: ${username}`);
  }

  const insertCategory = db.prepare("INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)");
  categories.forEach((name, index) => insertCategory.run(randomUUID(), name, index));
  console.log("Default categories are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
