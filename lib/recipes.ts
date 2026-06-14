import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import type { Category, RecipeDetail, RecipeSummary } from "@/lib/types";

function normalizeRecipe(row: Record<string, unknown>): RecipeSummary {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description as string | null,
    coverImageUrl: row.coverImageUrl as string | null,
    categoryId: row.categoryId as string | null,
    categoryName: row.categoryName as string | null,
    difficulty: row.difficulty as "easy" | "medium" | "hard",
    chef: row.chef as string | null,
    prepTimeMinutes: row.prepTimeMinutes as number | null,
    cookTimeMinutes: row.cookTimeMinutes as number | null,
    servings: row.servings as number | null,
    isFavorite: Boolean(row.isFavorite),
    lastCookedAt: row.lastCookedAt as number | null,
    updatedAt: Number(row.updatedAt),
  };
}

export function getCategories(): Category[] {
  return db
    .prepare('SELECT id, name, icon, sort_order as sortOrder FROM categories ORDER BY sort_order, name')
    .all() as Category[];
}

export function listRecipes(options: { userId?: string; q?: string; categoryId?: string; favoritesOnly?: boolean } = {}) {
  const args: unknown[] = [];
  let where = "r.is_archived = 0";
  if (options.q) {
    where += " AND (r.title LIKE ? OR r.description LIKE ? OR EXISTS (SELECT 1 FROM ingredients i WHERE i.recipe_id = r.id AND i.name LIKE ?))";
    const q = `%${options.q}%`;
    args.push(q, q, q);
  }
  if (options.categoryId) {
    where += " AND r.category_id = ?";
    args.push(options.categoryId);
  }
  if (options.favoritesOnly && options.userId) {
    where += " AND EXISTS (SELECT 1 FROM favorites f2 WHERE f2.recipe_id = r.id AND f2.user_id = ?)";
    args.push(options.userId);
  }
  const favoriteSql = options.userId ? "EXISTS (SELECT 1 FROM favorites f WHERE f.recipe_id = r.id AND f.user_id = ?)" : "0";
  const favoriteArgs = options.userId ? [options.userId] : [];
  const rows = db
    .prepare(`SELECT r.id, r.title, r.description, r.cover_image_url as coverImageUrl, r.category_id as categoryId,
      c.name as categoryName, r.difficulty, r.chef, r.prep_time_minutes as prepTimeMinutes, r.cook_time_minutes as cookTimeMinutes,
      r.servings, r.updated_at as updatedAt, ${favoriteSql} as isFavorite,
      (SELECT MAX(cooked_at) FROM cooking_logs cl WHERE cl.recipe_id = r.id) as lastCookedAt
      FROM recipes r LEFT JOIN categories c ON c.id = r.category_id
      WHERE ${where} ORDER BY r.updated_at DESC`)
    .all(...favoriteArgs, ...args) as Record<string, unknown>[];
  return rows.map(normalizeRecipe);
}

export function getRecipe(id: string, userId?: string): RecipeDetail | null {
  const favoriteSql = userId ? "EXISTS (SELECT 1 FROM favorites f WHERE f.recipe_id = r.id AND f.user_id = ?)" : "0";
  const args = userId ? [userId, id] : [id];
  const row = db
    .prepare(`SELECT r.id, r.title, r.description, r.cover_image_url as coverImageUrl, r.category_id as categoryId,
      c.name as categoryName, r.difficulty, r.chef, r.prep_time_minutes as prepTimeMinutes, r.cook_time_minutes as cookTimeMinutes,
      r.servings, r.tips, r.created_by_id as createdById, u.name as createdByName, r.updated_at as updatedAt,
      ${favoriteSql} as isFavorite, (SELECT MAX(cooked_at) FROM cooking_logs cl WHERE cl.recipe_id = r.id) as lastCookedAt
      FROM recipes r LEFT JOIN categories c ON c.id = r.category_id LEFT JOIN users u ON u.id = r.created_by_id
      WHERE r.id = ? AND r.is_archived = 0`)
    .get(...args) as Record<string, unknown> | undefined;
  if (!row) return null;
  const ingredients = db
    .prepare('SELECT id, name, amount, "group", sort_order as sortOrder FROM ingredients WHERE recipe_id = ? ORDER BY sort_order')
    .all(id) as RecipeDetail["ingredients"];
  const steps = db
    .prepare('SELECT id, step_number as stepNumber, content, image_url as imageUrl FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number')
    .all(id) as RecipeDetail["steps"];
  return { ...normalizeRecipe(row), tips: row.tips as string | null, createdById: String(row.createdById), createdByName: row.createdByName as string | null, ingredients, steps };
}

export function saveRecipe(input: {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string | null;
  categoryId?: string | null;
  difficulty: string;
  chef?: string | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings?: number | null;
  tips?: string;
  ingredients: { name: string; amount?: string; group: "main" | "seasoning" }[];
  steps: { content: string }[];
}) {
  const now = Date.now();
  const id = input.id ?? randomUUID();
  const tx = db.transaction(() => {
    if (input.id) {
      db.prepare(`UPDATE recipes SET title=?, description=?, cover_image_url=COALESCE(?, cover_image_url), category_id=?, difficulty=?, chef=?, prep_time_minutes=?, cook_time_minutes=?, servings=?, tips=?, updated_at=? WHERE id=?`)
        .run(input.title, input.description || null, input.coverImageUrl || null, input.categoryId || null, input.difficulty, input.chef || null, input.prepTimeMinutes ?? null, input.cookTimeMinutes ?? null, input.servings ?? null, input.tips || null, now, id);
      db.prepare("DELETE FROM ingredients WHERE recipe_id = ?").run(id);
      db.prepare("DELETE FROM recipe_steps WHERE recipe_id = ?").run(id);
    } else {
      db.prepare(`INSERT INTO recipes (id, title, description, cover_image_url, category_id, difficulty, chef, prep_time_minutes, cook_time_minutes, servings, tips, created_by_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, input.title, input.description || null, input.coverImageUrl || null, input.categoryId || null, input.difficulty, input.chef || null, input.prepTimeMinutes ?? null, input.cookTimeMinutes ?? null, input.servings ?? null, input.tips || null, input.userId, now);
    }
    const insertIngredient = db.prepare('INSERT INTO ingredients (id, recipe_id, name, amount, "group", sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    input.ingredients.forEach((item, index) => insertIngredient.run(randomUUID(), id, item.name, item.amount || null, item.group, index));
    const insertStep = db.prepare("INSERT INTO recipe_steps (id, recipe_id, step_number, content) VALUES (?, ?, ?, ?)");
    input.steps.forEach((step, index) => insertStep.run(randomUUID(), id, index + 1, step.content));
  });
  tx();
  return id;
}

export function archiveRecipe(id: string) {
  db.prepare("UPDATE recipes SET is_archived = 1, updated_at = ? WHERE id = ?").run(Date.now(), id);
}

export function toggleFavorite(userId: string, recipeId: string) {
  const existing = db.prepare("SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?").get(userId, recipeId) as { id: string } | undefined;
  if (existing) db.prepare("DELETE FROM favorites WHERE id = ?").run(existing.id);
  else db.prepare("INSERT INTO favorites (id, user_id, recipe_id) VALUES (?, ?, ?)").run(randomUUID(), userId, recipeId);
}

export function logCooked(userId: string, recipeId: string, note?: string) {
  db.prepare("INSERT INTO cooking_logs (id, user_id, recipe_id, note) VALUES (?, ?, ?, ?)").run(randomUUID(), userId, recipeId, note || null);
}
