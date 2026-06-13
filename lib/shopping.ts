import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { generateShoppingItems } from "@/lib/shopping-generator";
import { getOrCreateCurrentMenu, listMenuItems } from "@/lib/menu";

export function listShoppingLists() {
  return db.prepare("SELECT id, title, source, created_at as createdAt FROM shopping_lists ORDER BY created_at DESC").all() as { id: string; title: string; source: string; createdAt: number }[];
}

export function getLatestShoppingList(userId: string) {
  let list = db.prepare("SELECT id, title, source FROM shopping_lists ORDER BY created_at DESC LIMIT 1").get() as { id: string; title: string; source: string } | undefined;
  if (!list) {
    const id = randomUUID();
    db.prepare("INSERT INTO shopping_lists (id, title, source, created_by_id) VALUES (?, '家庭购物清单', 'manual', ?)").run(id, userId);
    list = { id, title: "家庭购物清单", source: "manual" };
  }
  const items = db.prepare("SELECT id, name, amount, category, checked FROM shopping_list_items WHERE shopping_list_id = ? ORDER BY checked, sort_order, name").all(list.id) as { id: string; name: string; amount?: string | null; category?: string | null; checked: 0 | 1 }[];
  return { ...list, items };
}

export function addShoppingItem(listId: string, name: string, amount?: string) {
  db.prepare("INSERT INTO shopping_list_items (id, shopping_list_id, name, amount, category) VALUES (?, ?, ?, ?, '食材')").run(randomUUID(), listId, name, amount || null);
}

export function toggleShoppingItem(id: string) {
  db.prepare("UPDATE shopping_list_items SET checked = CASE checked WHEN 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);
}

export function deleteShoppingItem(id: string) {
  db.prepare("DELETE FROM shopping_list_items WHERE id = ?").run(id);
}

export function clearChecked(listId: string) {
  db.prepare("DELETE FROM shopping_list_items WHERE shopping_list_id = ? AND checked = 1").run(listId);
}

export function generateFromCurrentMenu(userId: string) {
  const menu = getOrCreateCurrentMenu();
  const items = listMenuItems(menu.id).filter((item) => item.recipeId);
  const recipes = items.map((item) => ({
    recipeTitle: item.recipeTitle || "",
    ingredients: db.prepare('SELECT name, amount, "group" FROM ingredients WHERE recipe_id = ?').all(item.recipeId) as { name: string; amount?: string | null; group?: string | null }[],
  }));
  const generated = generateShoppingItems(recipes);
  const listId = randomUUID();
  db.prepare("INSERT INTO shopping_lists (id, title, source, created_by_id) VALUES (?, ?, 'weekly_menu', ?)").run(listId, "本周菜单购物清单", userId);
  const insert = db.prepare("INSERT INTO shopping_list_items (id, shopping_list_id, name, amount, category) VALUES (?, ?, ?, ?, ?)");
  generated.forEach((item) => insert.run(randomUUID(), listId, item.name, item.amount, item.category));
  return listId;
}
