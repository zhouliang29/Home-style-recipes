"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createMealOrder, deleteMealOrder } from "@/lib/meal-order";

export async function generateMealOrderAction(recipeIds: string[]): Promise<string> {
  const user = await requireUser();
  const id = createMealOrder({ createdById: user.id, recipeIds });
  revalidatePath("/recipes");
  return id;
}

export async function deleteMealOrderAction(formData: FormData) {
  await requireUser();
  deleteMealOrder(String(formData.get("id")));
  revalidatePath("/meal-order");
}
