import { requireUser } from "@/lib/auth";
import { listRecipes } from "@/lib/recipes";
import { RecipeCard } from "@/components/recipe-card";
import { PageTitle, EmptyState } from "@/components/ui-blocks";

export default async function FavoritesPage() {
  const user = await requireUser();
  const recipes = listRecipes({ userId: user.id, favoritesOnly: true });
  return <div className="space-y-5"><PageTitle title="我的收藏" />
    {recipes.length ? <div className="grid-cards">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div> : <EmptyState>还没有收藏菜谱，去菜谱页面收藏吧。</EmptyState>}
  </div>;
}
