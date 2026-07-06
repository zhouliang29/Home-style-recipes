import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import type { RecipeDetail } from "@/lib/types";

// 导出格式的类型定义
export type ExportedRecipe = {
  version: "1.0";
  exportedAt: number;
  recipes: ExportedRecipeItem[];
};

export type ExportedRecipeItem = {
  title: string;
  description?: string | null;
  categoryName?: string | null;
  difficulty: "easy" | "medium" | "hard";
  chef?: string | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings?: number | null;
  tips?: string | null;
  ingredients: { name: string; amount?: string | null; group: "main" | "seasoning" }[];
  steps: { content: string }[];
};

/**
 * 导出所有菜谱为 JSON 格式
 */
export function exportRecipes(userId: string): ExportedRecipe {
  // 获取所有菜谱详情
  const recipeIds = db
    .prepare("SELECT id FROM recipes WHERE is_archived = 0 AND created_by_id = ?")
    .all(userId)
    .map((row: any) => row.id) as string[];

  const recipes: ExportedRecipeItem[] = [];

  for (const id of recipeIds) {
    const recipeRow = db
      .prepare(`
        SELECT r.title, r.description, c.name as categoryName, r.difficulty, r.chef,
               r.prep_time_minutes as prepTimeMinutes, r.cook_time_minutes as cookTimeMinutes,
               r.servings, r.tips
        FROM recipes r LEFT JOIN categories c ON c.id = r.category_id
        WHERE r.id = ? AND r.is_archived = 0
      `)
      .get(id) as any;

    if (!recipeRow) continue;

    const ingredients = db
      .prepare('SELECT name, amount, "group" FROM ingredients WHERE recipe_id = ? ORDER BY sort_order')
      .all(id)
      .map((row: any) => ({
        name: row.name,
        amount: row.amount,
        group: row.group as "main" | "seasoning",
      }));

    const steps = db
      .prepare("SELECT content FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number")
      .all(id)
      .map((row: any) => ({ content: row.content }));

    recipes.push({
      title: recipeRow.title,
      description: recipeRow.description,
      categoryName: recipeRow.categoryName,
      difficulty: recipeRow.difficulty as "easy" | "medium" | "hard",
      chef: recipeRow.chef,
      prepTimeMinutes: recipeRow.prepTimeMinutes,
      cookTimeMinutes: recipeRow.cookTimeMinutes,
      servings: recipeRow.servings,
      tips: recipeRow.tips,
      ingredients,
      steps,
    });
  }

  return {
    version: "1.0",
    exportedAt: Date.now(),
    recipes,
  };
}

/**
 * 导入菜谱
 */
export function importRecipes(userId: string, data: ExportedRecipe): { imported: number; skipped: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  const tx = db.transaction(() => {
    for (const item of data.recipes) {
      try {
        // 检查是否已存在同名菜谱（简单去重）
        const existing = db
          .prepare("SELECT id FROM recipes WHERE title = ? AND created_by_id = ? AND is_archived = 0")
          .get(item.title, userId) as { id: string } | undefined;

        if (existing) {
          skipped++;
          continue;
        }

        // 处理分类
        let categoryId: string | null = null;
        if (item.categoryName) {
          const category = db
            .prepare("SELECT id FROM categories WHERE name = ?")
            .get(item.categoryName) as { id: string } | undefined;

          if (category) {
            categoryId = category.id;
          } else {
            // 创建新分类
            categoryId = randomUUID();
            const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM categories").get() as { m: number | null };
            db.prepare("INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)").run(
              categoryId,
              item.categoryName,
              (maxOrder.m ?? -1) + 1
            );
          }
        }

        // 创建菜谱
        const recipeId = randomUUID();
        const now = Date.now();

        db.prepare(`
          INSERT INTO recipes (id, title, description, cover_image_url, category_id, difficulty, chef,
                              prep_time_minutes, cook_time_minutes, servings, tips, created_by_id, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          recipeId,
          item.title,
          item.description || null,
          null,
          categoryId,
          item.difficulty,
          item.chef || null,
          item.prepTimeMinutes ?? null,
          item.cookTimeMinutes ?? null,
          item.servings ?? null,
          item.tips || null,
          userId,
          now
        );

        // 插入食材
        const insertIngredient = db.prepare(
          'INSERT INTO ingredients (id, recipe_id, name, amount, "group", sort_order) VALUES (?, ?, ?, ?, ?, ?)'
        );
        item.ingredients.forEach((ingredient, index) => {
          insertIngredient.run(
            randomUUID(),
            recipeId,
            ingredient.name,
            ingredient.amount || null,
            ingredient.group,
            index
          );
        });

        // 插入步骤
        const insertStep = db.prepare(
          "INSERT INTO recipe_steps (id, recipe_id, step_number, content) VALUES (?, ?, ?, ?)"
        );
        item.steps.forEach((step, index) => {
          insertStep.run(randomUUID(), recipeId, index + 1, step.content);
        });

        imported++;
      } catch (e) {
        errors.push(`导入「${item.title}」失败: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  });

  tx();
  return { imported, skipped, errors };
}

/**
 * 验证导入数据格式
 */
export function validateImportData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("数据格式错误");
    return { valid: false, errors };
  }

  const d = data as Record<string, unknown>;

  if (d.version !== "1.0") {
    errors.push("不支持的文件版本");
  }

  if (!Array.isArray(d.recipes)) {
    errors.push("recipes 必须是数组");
  } else {
    d.recipes.forEach((recipe, index) => {
      if (!recipe || typeof recipe !== "object") {
        errors.push(`第 ${index + 1} 个菜谱格式错误`);
        return;
      }
      const r = recipe as Record<string, unknown>;
      if (!r.title || typeof r.title !== "string") {
        errors.push(`第 ${index + 1} 个菜谱缺少标题`);
      }
      if (!Array.isArray(r.ingredients)) {
        errors.push(`第 ${index + 1} 个菜谱缺少食材`);
      }
      if (!Array.isArray(r.steps)) {
        errors.push(`第 ${index + 1} 个菜谱缺少步骤`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
