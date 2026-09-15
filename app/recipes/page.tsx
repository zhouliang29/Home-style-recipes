import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRecipes, getCategories } from "@/lib/recipes";
import { RecipeOrderArea } from "@/components/recipe-order-area";
import { CHEF_OPTIONS } from "@/lib/constants";

export default async function RecipesPage(props: { searchParams: Promise<{ q?: string; categoryId?: string; chef?: string }> }) {
  const user = await requireUser();
  const { q, categoryId, chef } = await props.searchParams;
  const recipes = listRecipes({ userId: user.id, q, categoryId, chef });
  const allRecipes = listRecipes({ userId: user.id });
  const categories = getCategories();

  // 合并筛选：厨师项（周良/张幸）走 chef 参数，其余走 categoryId；id=null 表示"全部"
  const filterHref = (id: string | null, isChef: boolean) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (id !== null) {
      if (isChef) p.set("chef", id);
      else p.set("categoryId", id);
    }
    const s = p.toString();
    return `/recipes${s ? `?${s}` : ""}`;
  };
  const isActive = (id: string, isChef: boolean) => (isChef ? chef === id : !chef && categoryId === id);
  const allActive = !categoryId && !chef;
  // 仅清除搜索词，保留当前筛选
  const clearSearchHref = (() => {
    const p = new URLSearchParams();
    if (categoryId) p.set("categoryId", categoryId);
    if (chef) p.set("chef", chef);
    const s = p.toString();
    return `/recipes${s ? `?${s}` : ""}`;
  })();

  // 筛选项数据：分类里排除与人名重合的项（周良/张幸只在厨师区出现）
  const chefSet = new Set<string>(CHEF_OPTIONS);
  const allFilters: { id: string; label: string; icon?: string; isChef: boolean }[] = [
    ...categories.filter((c) => !chefSet.has(c.name)).map((c) => ({ id: c.id, label: c.name, icon: c.icon || undefined, isChef: false })),
    ...CHEF_OPTIONS.map((c) => ({ id: c, label: c, isChef: true })),
  ];

  const sideItem = (f: (typeof allFilters)[number]) => {
    const active = isActive(f.id, f.isChef);
    return (
      <Link
        key={f.id}
        href={filterHref(f.id, f.isChef)}
        className={`mobile-action flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-center text-xs font-bold leading-tight transition active:scale-95 ${
          active
            ? f.isChef
              ? "bg-amber-600 text-white shadow-md ring-1 ring-amber-600"
              : "bg-orange-500 text-white shadow-md ring-1 ring-orange-500"
            : "bg-white text-orange-800 ring-1 ring-orange-100"
        }`}
      >
        {f.isChef ? <span>👨‍🍳</span> : f.icon ? <span>{f.icon}</span> : null}
        <span className="w-full truncate px-0.5">{f.label}</span>
      </Link>
    );
  };

  return (
    <div className="space-y-4">
      {/* 标题 + 搜索 */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-orange-700 sm:text-3xl">全部菜谱</h1>
        <p className="mt-0.5 text-sm muted">点卡片右上角「+」选菜，攒一篮生成本餐菜单</p>
      </div>
      <form action="/recipes" className="flex gap-2">
        {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
        {chef && <input type="hidden" name="chef" value={chef} />}
        <input className="field flex-1" name="q" defaultValue={q} placeholder="搜索菜名或食材…" enterKeyHint="search" />
        {q && <Link className="btn secondary shrink-0" href={clearSearchHref}>清除</Link>}
        <button className="btn shrink-0">搜索</button>
      </form>

      {/* 手机：左侧分类栏 + 右侧内容 */}
      <div className="flex items-start gap-2.5">
        <aside className="sticky top-20 flex max-h-[calc(100vh-11rem)] w-[4.6rem] shrink-0 flex-col gap-1.5 self-start overflow-y-auto pb-1 sm:hidden [&::-webkit-scrollbar]:hidden">
          <Link
            href={filterHref(null, false)}
            className={`mobile-action flex items-center justify-center rounded-xl px-1 py-2 text-xs font-bold transition active:scale-95 ${
              allActive ? "bg-orange-500 text-white shadow-md ring-1 ring-orange-500" : "bg-white text-orange-800 ring-1 ring-orange-100"
            }`}
          >
            全部
          </Link>
          {allFilters.map(sideItem)}
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {/* 桌面：横滑 chips（手机用左侧栏，隐藏这行） */}
          <div className="hidden gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex sm:flex-wrap [&::-webkit-scrollbar]:hidden">
            <Link href={filterHref(null, false)} className={"chip shrink-0 " + (allActive ? "chip-active" : "")}>全部</Link>
            {allFilters.map((f) => (
              <Link
                key={f.id}
                href={filterHref(f.id, f.isChef)}
                className={"chip shrink-0 " + (f.isChef ? "chip-amber" : "") + " " + (isActive(f.id, f.isChef) ? (f.isChef ? "chip-amber-active" : "chip-active") : "")}
              >
                {f.isChef ? "👨‍🍳 " : f.icon ? <span className="mr-0.5">{f.icon}</span> : null}{f.label}
              </Link>
            ))}
          </div>
          <RecipeOrderArea recipes={recipes} allRecipes={allRecipes} />
        </div>
      </div>
    </div>
  );
}
