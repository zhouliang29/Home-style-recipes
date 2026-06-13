"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { addMenuItem, deleteMenuItem } from "@/lib/menu";
import type { MealType } from "@/lib/week";

export async function addMenuItemAction(formData: FormData) {
  await requireUser();
  addMenuItem({
    recipeId: String(formData.get("recipeId") || "") || null,
    customText: String(formData.get("customText") || "") || null,
    date: Number(formData.get("date")),
    mealType: formData.get("mealType") as MealType,
  });
  revalidatePath("/menu");
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireUser();
  deleteMenuItem(String(formData.get("id")));
  revalidatePath("/menu");
}
