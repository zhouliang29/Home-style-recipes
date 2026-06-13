"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveRecipe, archiveRecipe, toggleFavorite, logCooked } from "@/lib/recipes";
import { saveRecipeImage } from "@/lib/image-upload";
import { recipeInputSchema } from "@/lib/validators/recipe";

export async function createRecipe(formData: FormData) {
  const user = await requireUser();
  const raw = { title: formData.get("title") || "", description: formData.get("description") || "", categoryId: formData.get("categoryId") || null, difficulty: formData.get("difficulty") || "easy", prepTimeMinutes: formData.get("prepTimeMinutes"), cookTimeMinutes: formData.get("cookTimeMinutes"), servings: formData.get("servings"), tips: formData.get("tips") || "", ingredients: JSON.parse(String(formData.get("ingredients") || "[]")), steps: JSON.parse(String(formData.get("steps") || "[]")) };
  const input = recipeInputSchema.parse(raw);
  const coverImageUrl = await saveRecipeImage(formData.get("coverImage") as File | null);
  const id = saveRecipe({ ...input, userId: user.id, coverImageUrl });
  revalidatePath("/recipes");
  revalidatePath("/");
  redirect(`/recipes/${id}`);
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  const user = await requireUser();
  const raw = { title: formData.get("title") || "", description: formData.get("description") || "", categoryId: formData.get("categoryId") || null, difficulty: formData.get("difficulty") || "easy", prepTimeMinutes: formData.get("prepTimeMinutes"), cookTimeMinutes: formData.get("cookTimeMinutes"), servings: formData.get("servings"), tips: formData.get("tips") || "", ingredients: JSON.parse(String(formData.get("ingredients") || "[]")), steps: JSON.parse(String(formData.get("steps") || "[]")) };
  const input = recipeInputSchema.parse(raw);
  const coverImageUrl = await saveRecipeImage(formData.get("coverImage") as File | null);
  saveRecipe({ ...input, id: recipeId, userId: user.id, coverImageUrl });
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/recipes");
  revalidatePath("/");
  redirect(`/recipes/${recipeId}`);
}

export async function toggleFavoriteAction(recipeId: string) {
  const user = await requireUser();
  toggleFavorite(user.id, recipeId);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/recipes");
  revalidatePath("/favorites");
}

export async function archiveRecipeAction(recipeId: string) {
  await requireUser();
  archiveRecipe(recipeId);
  revalidatePath("/recipes");
  redirect("/recipes");
}

export async function logCookedAction(formData: FormData) {
  const user = await requireUser();
  logCooked(user.id, String(formData.get("recipeId")), String(formData.get("note") || ""));
  revalidatePath(`/recipes/${formData.get("recipeId")}`);
}
