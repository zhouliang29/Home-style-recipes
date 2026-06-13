import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRecipes, getCategories } from "@/lib/recipes";
import { RecipeCard } from "@/components/recipe-card";
import { PageTitle, EmptyState } from "@/components/ui-blocks";

export default async function RecipesPage(props: { searchParams: Promise<{ q?: string; categoryId?: string }> }) {
  const user = await requireUser();
  const { q, categoryId } = await props.searchParams;
  const recipes = listRecipes({ userId: user.id, q, categoryId });
  const categories = getCategories();
  return <div className="space-y-5"><PageTitle title="全部菜谱" action={<form action="/recipes" className="flex gap-2"><input className="field w-56" name="q" defaultValue={q} placeholder="搜索菜名或食材" /><button className="btn">搜索</button></form>} />
    <div className="flex flex-wrap gap-2">{categories.map((c) => <Link href={`/recipes?categoryId=${c.id}`} className={"rounded-full px-3 py-1 font-bold ring-1 "+(c.id===categoryId?"bg-orange-500 text-white ring-orange-500":"bg-white text-orange-700 ring-orange-200")} key={c.id}>{c.name}</Link>)}<Link href="/recipes" className={"rounded-full px-3 py-1 font-bold ring-1 "+(categoryId?"bg-white text-orange-700 ring-orange-200":"bg-orange-500 text-white ring-orange-500")}>全部</Link></div>
    {recipes.length ? <div className="grid-cards">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div> : <EmptyState>没有找到菜谱{q ? `"${q}"` : ""}。</EmptyState>}
  </div>;
}
