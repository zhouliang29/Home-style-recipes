import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/recipes";
import { RecipeForm } from "@/components/recipe-form";

export default async function NewRecipePage() {
  const user = await requireUser();
  return <div><RecipeForm categories={getCategories()} userId={user.id} /></div>;
}
