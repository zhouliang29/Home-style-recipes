import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRecipes, getCategories } from "@/lib/recipes";
import { RecipeOrderArea } from "@/components/recipe-order-area";
import { PageTitle } from "@/components/ui-blocks";
import { CHEF_OPTIONS } from "@/lib/constants";

export default async function RecipesPage(props: { searchParams: Promise<{ q?: string; categoryId?: string; chef?: string }> }) {
  const user = await requireUser();
  const { q, categoryId, chef } = await props.searchParams;
  const recipes = listRecipes({ userId: user.id, q, categoryId, chef });
  const categories = getCategories();
  return <div className="space-y-5"><PageTitle title="全部菜谱" subtitle="点击菜谱卡片右上角「+」点菜，选好后在浮窗生成本餐菜单" action={<form action="/recipes" className="flex gap-2"><input className="field w-56" name="q" defaultValue={q} placeholder="搜索菜名或食材" /><button className="btn">搜索</button></form>} />
    {/* 分类筛选 */}
    <div className="flex flex-wrap gap-2">{categories.map((c) => <Link href={`/recipes?categoryId=${c.id}${chef ? `&chef=${encodeURIComponent(chef)}` : ""}`} className={"rounded-full px-3 py-1 font-bold ring-1 "+(c.id===categoryId?"bg-orange-500 text-white ring-orange-500":"bg-white text-orange-700 ring-orange-200")} key={c.id}>{c.icon && <span className="mr-0.5">{c.icon}</span>}{c.name}</Link>)}<Link href={chef ? `/recipes?chef=${encodeURIComponent(chef)}` : "/recipes"} className={"rounded-full px-3 py-1 font-bold ring-1 "+(categoryId?"bg-white text-orange-700 ring-orange-200":"bg-orange-500 text-white ring-orange-500")}>全部</Link></div>
    {/* 厨师筛选 */}
    <div className="flex flex-wrap gap-2">{CHEF_OPTIONS.map((c) => <Link href={`/recipes?chef=${encodeURIComponent(c)}${categoryId ? `&categoryId=${categoryId}` : ""}`} className={"rounded-full px-3 py-1 font-bold ring-1 "+(c===chef?"bg-amber-600 text-white ring-amber-600":"bg-amber-50 text-amber-800 ring-amber-200")} key={c}>👨‍🍳 {c}</Link>)}<Link href={categoryId ? `/recipes?categoryId=${categoryId}` : "/recipes"} className={"rounded-full px-3 py-1 font-bold ring-1 "+(chef?"bg-amber-50 text-amber-800 ring-amber-200":"bg-amber-600 text-white ring-amber-600")}>全部厨师</Link></div>
    <RecipeOrderArea recipes={recipes} />
  </div>;
}
