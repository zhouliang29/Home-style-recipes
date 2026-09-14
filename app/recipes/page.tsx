import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRecipes, getCategories } from "@/lib/recipes";
import { RecipeOrderArea } from "@/components/recipe-order-area";
import { ImportExportButtons } from "@/components/import-export-button";
import { CHEF_OPTIONS } from "@/lib/constants";

export default async function RecipesPage(props: { searchParams: Promise<{ q?: string; categoryId?: string; chef?: string }> }) {
  const user = await requireUser();
  const { q, categoryId, chef } = await props.searchParams;
  const recipes = listRecipes({ userId: user.id, q, categoryId, chef });
  const allRecipes = listRecipes({ userId: user.id });
  const categories = getCategories();

  const catHref = (id: string) => `/recipes?categoryId=${id}${chef ? `&chef=${encodeURIComponent(chef)}` : ""}`;
  const chefHref = (c: string) => `/recipes?chef=${encodeURIComponent(c)}${categoryId ? `&categoryId=${categoryId}` : ""}`;

  return (
    <div className="space-y-4">
      {/* 标题 + 导入导出 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-orange-700 sm:text-3xl">全部菜谱</h1>
          <p className="mt-0.5 text-sm muted">点卡片右上角「+」选菜，攒一篮生成本餐菜单</p>
        </div>
        <ImportExportButtons />
      </div>

      {/* 搜索 */}
      <form action="/recipes" className="flex gap-2">
        <input className="field flex-1" name="q" defaultValue={q} placeholder="搜索菜名或食材…" enterKeyHint="search" />
        {q && <Link className="btn secondary shrink-0" href="/recipes">清除</Link>}
        <button className="btn shrink-0">搜索</button>
      </form>

      {/* 分类筛选：横滑胶囊 */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        <Link href={chef ? `/recipes?chef=${encodeURIComponent(chef)}` : "/recipes"} className={"chip shrink-0 " + (categoryId ? "" : "chip-active")}>全部</Link>
        {categories.map((c) => (
          <Link key={c.id} href={catHref(c.id)} className={"chip shrink-0 " + (c.id === categoryId ? "chip-active" : "")}>
            {c.icon && <span>{c.icon}</span>}{c.name}
          </Link>
        ))}
      </div>

      {/* 厨师筛选 */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        <Link href={categoryId ? `/recipes?categoryId=${categoryId}` : "/recipes"} className={"chip chip-amber shrink-0 " + (chef ? "" : "chip-amber-active")}>全部厨师</Link>
        {CHEF_OPTIONS.map((c) => (
          <Link key={c} href={chefHref(c)} className={"chip chip-amber shrink-0 " + (c === chef ? "chip-amber-active" : "")}>
            👨‍🍳 {c}
          </Link>
        ))}
      </div>

      <RecipeOrderArea recipes={recipes} allRecipes={allRecipes} />
    </div>
  );
}
