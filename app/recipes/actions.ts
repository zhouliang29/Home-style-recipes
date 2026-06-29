"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveRecipe, archiveRecipe, toggleFavorite, logCooked, createCategory } from "@/lib/recipes";
import { saveRecipeImage } from "@/lib/image-upload";
import { recipeInputSchema } from "@/lib/validators/recipe";
import { ZodError } from "zod";

function formatError(e: unknown): { error: string } {
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return { error: first?.message || "输入验证失败" };
  }
  if (e instanceof Error) {
    return { error: e.message };
  }
  return { error: "保存失败，请重试" };
}

import { isNextInternalError } from "@/lib/next-errors";

export async function createRecipe(formData: FormData): Promise<{ ok: true; id: string } | { error: string }> {
  try {
    const user = await requireUser();
    const raw = { title: formData.get("title") || "", description: formData.get("description") || "", categoryId: formData.get("categoryId") || null, difficulty: formData.get("difficulty") || "easy", prepTimeMinutes: formData.get("prepTimeMinutes"), cookTimeMinutes: formData.get("cookTimeMinutes"), servings: formData.get("servings"), tips: formData.get("tips") || "", ingredients: JSON.parse(String(formData.get("ingredients") || "[]")), steps: JSON.parse(String(formData.get("steps") || "[]")) };
    const input = recipeInputSchema.parse(raw);
    const coverImageUrl = await saveRecipeImage(formData.get("coverImage") as File | null);
    const id = saveRecipe({ ...input, userId: user.id, coverImageUrl });
    revalidatePath("/recipes");
    revalidatePath("/");
    return { ok: true, id };
  } catch (e) {
    // redirect() 等内部异常必须重新抛出，否则客户端无反应
    if (isNextInternalError(e)) throw e;
    return formatError(e);
  }
}

export async function updateRecipe(recipeId: string, formData: FormData): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requireUser();
    const raw = { title: formData.get("title") || "", description: formData.get("description") || "", categoryId: formData.get("categoryId") || null, difficulty: formData.get("difficulty") || "easy", prepTimeMinutes: formData.get("prepTimeMinutes"), cookTimeMinutes: formData.get("cookTimeMinutes"), servings: formData.get("servings"), tips: formData.get("tips") || "", ingredients: JSON.parse(String(formData.get("ingredients") || "[]")), steps: JSON.parse(String(formData.get("steps") || "[]")) };
    const input = recipeInputSchema.parse(raw);
    const coverImageUrl = await saveRecipeImage(formData.get("coverImage") as File | null);
    saveRecipe({ ...input, id: recipeId, userId: user.id, coverImageUrl });
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return formatError(e);
  } finally {
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath("/recipes");
    revalidatePath("/");
  }
}

export async function toggleFavoriteAction(recipeId: string) {
  const user = await requireUser();
  toggleFavorite(user.id, recipeId);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/recipes");
  revalidatePath("/favorites");
}

export async function archiveRecipeAction(recipeId: string): Promise<{ ok: true } | { error: string }> {
  try {
    await requireUser();
    archiveRecipe(recipeId);
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "删除失败" };
  } finally {
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath("/recipes");
    revalidatePath("/");
  }
}

export async function logCookedAction(formData: FormData) {
  const user = await requireUser();
  logCooked(user.id, String(formData.get("recipeId")), String(formData.get("note") || ""));
  revalidatePath(`/recipes/${formData.get("recipeId")}`);
}

export async function createCategoryAction(name: string): Promise<{ id: string; name: string } | { error: string }> {
  try {
    await requireUser();
    const trimmed = name.trim();
    if (!trimmed) return { error: "分类名称不能为空" };
    if (trimmed.length > 20) return { error: "分类名称不能超过20个字" };
    const category = createCategory(trimmed);
    revalidatePath("/recipes");
    revalidatePath("/recipes/new");
    return { id: category.id, name: category.name };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "创建分类失败" };
  }
}
