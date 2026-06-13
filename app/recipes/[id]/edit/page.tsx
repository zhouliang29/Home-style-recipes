import { notFound, redirect } from "next/navigation";
import { requireUser, canEditRecipe } from "@/lib/auth";
import { getRecipe, getCategories } from "@/lib/recipes";
import { RecipeForm } from "@/components/recipe-form";

export default async function EditRecipePage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const recipe = getRecipe(id, user.id);
  if (!recipe) notFound();
  if (!canEditRecipe(user, recipe)) redirect(`/recipes/${id}`);
  return <RecipeForm categories={getCategories()} recipe={recipe} userId={user.id} />;
}
