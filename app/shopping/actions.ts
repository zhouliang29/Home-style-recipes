"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { addShoppingItem, clearChecked, deleteShoppingItem, generateFromCurrentMenu, getLatestShoppingList, toggleShoppingItem } from "@/lib/shopping";

export async function addShoppingItemAction(formData: FormData) {
  const user = await requireUser();
  const list = getLatestShoppingList(user.id);
  const name = String(formData.get("name") || "").trim();
  if (name) addShoppingItem(list.id, name, String(formData.get("amount") || ""));
  revalidatePath("/shopping");
}
export async function toggleShoppingItemAction(formData: FormData) { await requireUser(); toggleShoppingItem(String(formData.get("id"))); revalidatePath("/shopping"); }
export async function deleteShoppingItemAction(formData: FormData) { await requireUser(); deleteShoppingItem(String(formData.get("id"))); revalidatePath("/shopping"); }
export async function clearCheckedAction(formData: FormData) { await requireUser(); clearChecked(String(formData.get("listId"))); revalidatePath("/shopping"); }
export async function generateShoppingFromMenuAction() { const user = await requireUser(); const id = generateFromCurrentMenu(user.id); revalidatePath("/shopping"); redirect(`/shopping?list=${id}`); }
