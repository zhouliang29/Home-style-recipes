import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { startOfWeek, type MealType } from "@/lib/week";

export function getOrCreateCurrentMenu() {
  const weekStart = startOfWeek().getTime();
  let menu = db.prepare("SELECT id, week_start_date as weekStartDate FROM weekly_menus WHERE week_start_date = ?").get(weekStart) as { id: string; weekStartDate: number } | undefined;
  if (!menu) {
    const id = randomUUID();
    db.prepare("INSERT INTO weekly_menus (id, week_start_date) VALUES (?, ?)").run(id, weekStart);
    menu = { id, weekStartDate: weekStart };
  }
  return menu;
}

export function listMenuItems(menuId: string) {
  return db.prepare(`SELECT mi.id, mi.recipe_id as recipeId, mi.custom_text as customText, mi.date, mi.meal_type as mealType,
    r.title as recipeTitle FROM weekly_menu_items mi LEFT JOIN recipes r ON r.id = mi.recipe_id
    WHERE mi.weekly_menu_id = ? ORDER BY mi.date, mi.meal_type, mi.sort_order`).all(menuId) as { id: string; recipeId?: string | null; customText?: string | null; date: number; mealType: MealType; recipeTitle?: string | null }[];
}

export function addMenuItem(input: { recipeId?: string | null; customText?: string | null; date: number; mealType: MealType }) {
  const menu = getOrCreateCurrentMenu();
  db.prepare("INSERT INTO weekly_menu_items (id, weekly_menu_id, recipe_id, custom_text, date, meal_type) VALUES (?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), menu.id, input.recipeId || null, input.customText || null, input.date, input.mealType);
}

export function deleteMenuItem(id: string) {
  db.prepare("DELETE FROM weekly_menu_items WHERE id = ?").run(id);
}
