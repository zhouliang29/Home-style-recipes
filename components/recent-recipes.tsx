import { listRecipes } from "@/lib/recipes";
import { RecipeCard } from "@/components/recipe-card";
import { getCurrentUser } from "@/lib/auth";

export async function RecentRecipes() {
  const user = await getCurrentUser();
  const recipes = listRecipes({ userId: user?.id }).slice(0, 4);
  if (!recipes.length) return <div className="card p-6 muted">还没有菜谱，先新增一道拿手菜吧。</div>;
  return <div className="grid-cards">{recipes.map((recipe) => <RecipeCard recipe={recipe} key={recipe.id} />)}</div>;
}
