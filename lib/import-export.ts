import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { db } from "@/db/client";
import type { RecipeDetail } from "@/lib/types";
import { allowedImageMimes, imageMimeFromUrl, saveRecipeImageBuffer, uploadsFilePathFromUrl } from "@/lib/image-upload";

// 导出格式的类型定义
// v1.1 在 v1.0 基础上增加 base64 内嵌图片；仍可导入旧 v1.0 文件（无图片）
export type ExportedRecipe = {
  version: "1.1";
  exportedAt: number;
  recipes: ExportedRecipeItem[];
};

// base64 内嵌的图片
export type ExportedImage = {
  // 图片 MIME 类型：image/jpeg / image/png / image/webp
  mimeType: string;
  // 文件内容的 base64 编码
  data: string;
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
  steps: { content: string; image?: ExportedImage | null }[];
  // 封面图（v1.1 新增）
  coverImage?: ExportedImage | null;
};

// 读取本地 uploads 图片并转为 base64；文件缺失或非本地图片时返回 null
function readImageAsExported(url: string | null | undefined): ExportedImage | null {
  const mimeType = imageMimeFromUrl(url);
  if (!mimeType || !url) return null;
  const filePath = uploadsFilePathFromUrl(url);
  if (!filePath) return null;
  try {
    const data = fs.readFileSync(filePath);
    if (data.length === 0) return null;
    return { mimeType, data: data.toString("base64") };
  } catch {
    // 文件丢失时跳过图片，不影响导出
    return null;
  }
}

// 解码导入文件中的 base64 图片并保存到本地，返回可访问 URL；数据非法时抛错
function saveImportedImage(image: unknown): string {
  if (!image || typeof image !== "object") {
    throw new Error("图片数据格式错误");
  }
  const img = image as Record<string, unknown>;
  const mimeType = typeof img.mimeType === "string" ? img.mimeType : "";
  if (!allowedImageMimes.includes(mimeType)) {
    throw new Error(`不支持的图片格式（${mimeType || "未知"}），只支持 JPG、PNG、WebP`);
  }
  if (typeof img.data !== "string" || img.data.length === 0) {
    throw new Error("图片内容为空");
  }
  const buffer = Buffer.from(img.data, "base64");
  // base64 解码失败或内容损坏时长度可能为 0
  if (buffer.length === 0) {
    throw new Error("图片内容无效");
  }
  return saveRecipeImageBuffer(buffer, mimeType);
}

/**
 * 导出所有菜谱为 JSON 格式
 */
export function exportRecipes(userId: string): ExportedRecipe {
  // 获取所有菜谱详情
  const recipeIds = db
    .prepare("SELECT id FROM recipes WHERE is_archived = 0")
    .all()
    .map((row: any) => row.id) as string[];

  const recipes: ExportedRecipeItem[] = [];

  for (const id of recipeIds) {
    const recipeRow = db
      .prepare(`
        SELECT r.title, r.description, r.cover_image_url as coverImageUrl, c.name as categoryName, r.difficulty, r.chef,
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
      .prepare("SELECT content, image_url as imageUrl FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number")
      .all(id)
      .map((row: any) => ({
        content: row.content,
        image: readImageAsExported(row.imageUrl),
      }));

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
      coverImage: readImageAsExported(recipeRow.coverImageUrl),
    });
  }

  return {
    version: "1.1",
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

        // 处理封面图（v1.1 文件才有；图片保存失败会导致该菜谱导入失败并计入 errors）
        const coverImageUrl = item.coverImage ? saveImportedImage(item.coverImage) : null;

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
          coverImageUrl,
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
          "INSERT INTO recipe_steps (id, recipe_id, step_number, content, image_url) VALUES (?, ?, ?, ?, ?)"
        );
        item.steps.forEach((step, index) => {
          const stepImageUrl = step.image ? saveImportedImage(step.image) : null;
          insertStep.run(randomUUID(), recipeId, index + 1, step.content, stepImageUrl);
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

  // v1.1 内嵌图片，v1.0 为旧格式（无图片），两者均可导入
  if (d.version !== "1.0" && d.version !== "1.1") {
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
      } else {
        r.steps.forEach((step, stepIndex) => {
          if (!step || typeof step !== "object") return;
          const image = (step as Record<string, unknown>).image;
          if (image !== undefined && image !== null && !isValidExportedImage(image)) {
            errors.push(`第 ${index + 1} 个菜谱的第 ${stepIndex + 1} 个步骤图片格式错误`);
          }
        });
      }
      if (r.coverImage !== undefined && r.coverImage !== null && !isValidExportedImage(r.coverImage)) {
        errors.push(`第 ${index + 1} 个菜谱的封面图片格式错误`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// 校验内嵌图片的结构（内容是否为合法 base64 由导入时解码兜底）
function isValidExportedImage(image: unknown): boolean {
  if (!image || typeof image !== "object") return false;
  const img = image as Record<string, unknown>;
  return typeof img.mimeType === "string" && typeof img.data === "string" && img.data.length > 0;
}
