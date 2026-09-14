import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCategories, listRecipes } from "@/lib/recipes";
import { pickRandomRecipes } from "@/lib/random-recipe";
import { EmptyState } from "@/components/ui-blocks";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";
import { CHEF_OPTIONS } from "@/lib/constants";

const difficultyLabel = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export default async function RandomPage(props: { searchParams: Promise<{ categoryId?: string; difficulty?: string; chef?: string; excludeRecent?: string; count?: string }> }) {
  const user = await requireUser();
  const s = await props.searchParams;
  const categories = getCategories();
  const excludeRecentDays = s.excludeRecent !== "false" ? 7 : null;
  const count = Math.min(5, Math.max(1, Number(s.count) || 1));
  const all = listRecipes({ userId: user.id });
  const now = new Date();
  const chosen = pickRandomRecipes(all.map((r) => ({ ...r, isArchived: false })), count, {
    categoryId: s.categoryId || null, difficulty: s.difficulty || null, chef: s.chef || null, excludeRecentDays, now,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-orange-700 sm:text-3xl">今天吃什么 🎲</h1>
        <p className="mt-0.5 text-sm muted">选好条件，让系统帮你决定</p>
      </div>

      {/* 筛选条件 */}
      <form action="/random" className="card grid gap-2.5 p-4 sm:grid-cols-3 sm:items-end">
        <label className="label !gap-1 text-sm">
          数量
          <select className="field !py-2 text-sm" name="count" defaultValue={String(count)}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} 道</option>)}
          </select>
        </label>
        <label className="label !gap-1 text-sm">
          分类
          <select className="field !py-2 text-sm" name="categoryId" defaultValue={s.categoryId || ""}>
            <option value="">所有分类</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="label !gap-1 text-sm">
          难度 / 厨师
          <div className="flex gap-2">
            <select className="field !py-2 text-sm" name="difficulty" defaultValue={s.difficulty || ""}>
              <option value="">全部难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">费工夫</option>
            </select>
            <select className="field !py-2 text-sm" name="chef" defaultValue={s.chef || ""}>
              <option value="">全部厨师</option>
              {CHEF_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </label>
        <button className="btn btn-lg sm:col-span-3">🎲 换一批</button>
      </form>

      {chosen.length ? (
        <div className="space-y-4">
          {chosen.map((r, i) => (
            <div className="animate-fade-up" key={r.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <Link href={`/recipes/${r.id}`} className="card card-hover block overflow-hidden">
                <div className="relative flex aspect-[8/3] w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-6xl">
                  {r.coverImageUrl ? <img src={r.coverImageUrl} alt="" className="h-full w-full object-cover" /> : <span className="opacity-60">🍳</span>}
                  <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sm font-black text-orange-600 shadow">{i + 1}</span>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-xl font-black text-orange-800 sm:text-2xl">{r.title}</h3>
                  {r.description && <p className="mt-1.5 line-clamp-2 text-sm muted">{r.description}</p>}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-bold text-orange-700">
                    {r.categoryName && <span className="rounded-full bg-orange-100 px-2.5 py-1">{r.categoryName}</span>}
                    <span className="rounded-full bg-orange-100 px-2.5 py-1">{difficultyLabel[r.difficulty] ?? r.difficulty}</span>
                    {r.chef ? <span className="rounded-full bg-orange-100 px-2.5 py-1">👨‍🍳 {r.chef}</span> : null}
                    {r.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-2.5 py-1">⏱ {r.cookTimeMinutes} 分</span> : null}
                  </div>
                </div>
              </Link>
              <div className="mt-2">
                <AddToMenuDialog recipeId={r.id} recipeTitle={r.title} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>没有符合条件的菜谱，试试放宽筛选条件吧。</EmptyState>
      )}
    </div>
  );
}
