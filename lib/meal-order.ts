import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import type { MealOrder, MealOrderItem } from "@/lib/types";

export function createMealOrder(input: { createdById: string; recipeIds: string[] }): string {
  const id = randomUUID();
  // 先查菜谱信息
  const recipes = db
    .prepare('SELECT id, title, cover_image_url as coverImageUrl FROM recipes WHERE id IN (' + input.recipeIds.map(() => '?').join(',') + ')')
    .all(...input.recipeIds) as { id: string; title: string; coverImageUrl: string | null }[];

  const tx = db.transaction(() => {
    db.prepare("INSERT INTO meal_orders (id, total_count, created_by_id) VALUES (?, ?, ?)")
      .run(id, recipes.length, input.createdById);

    const insertItem = db.prepare(
      "INSERT INTO meal_order_items (id, meal_order_id, recipe_id, recipe_title, cover_image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
    );
    recipes.forEach((r, index) => {
      insertItem.run(randomUUID(), id, r.id, r.title, r.coverImageUrl, index);
    });
  });
  tx();
  return id;
}

export function getMealOrder(id: string): (MealOrder & { items: MealOrderItem[] }) | null {
  const order = db
    .prepare("SELECT id, total_count as totalCount, created_by_id as createdById, created_at as createdAt FROM meal_orders WHERE id = ?")
    .get(id) as MealOrder | undefined;
  if (!order) return null;

  const items = db
    .prepare("SELECT id, meal_order_id as mealOrderId, recipe_id as recipeId, recipe_title as recipeTitle, cover_image_url as coverImageUrl, sort_order as sortOrder FROM meal_order_items WHERE meal_order_id = ? ORDER BY sort_order")
    .all(id) as MealOrderItem[];

  return { ...order, items };
}

export function listMealOrders(userId: string): (MealOrder & { items: MealOrderItem[] })[] {
  const orders = db
    .prepare("SELECT id, total_count as totalCount, created_by_id as createdById, created_at as createdAt FROM meal_orders WHERE created_by_id = ? ORDER BY created_at DESC LIMIT 50")
    .all(userId) as MealOrder[];

  return orders.map((order) => {
    const items = db
      .prepare("SELECT id, meal_order_id as mealOrderId, recipe_id as recipeId, recipe_title as recipeTitle, cover_image_url as coverImageUrl, sort_order as sortOrder FROM meal_order_items WHERE meal_order_id = ? ORDER BY sort_order")
      .all(order.id) as MealOrderItem[];
    return { ...order, items };
  });
}

export function deleteMealOrder(id: string) {
  db.prepare("DELETE FROM meal_orders WHERE id = ?").run(id);
}
