import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCategories, listRecipes } from "@/lib/recipes";
import { pickRandomRecipes } from "@/lib/random-recipe";
import { PageTitle, EmptyState } from "@/components/ui-blocks";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";
import { CHEF_OPTIONS } from "@/lib/constants";

export default async function RandomPage(props: { searchParams: Promise<{ categoryId?: string; difficulty?: string; chef?: string; excludeRecent?: string; count?: string }> }) {
  const user = await requireUser();
  const s = await props.searchParams;
  const categories = getCategories();
  const excludeRecentDays = s.excludeRecent !== "false" ? 7 : null;
  const count = Math.min(5, Math.max(1, Number(s.count) || 1));
  const all = listRecipes({ userId: user.id });
  const now = new Date();
  const chosen = pickRandomRecipes(all.map((r) => ({ ...r, isArchived: false })), count, { categoryId: s.categoryId || null, difficulty: s.difficulty || null, chef: s.chef || null, excludeRecentDays, now });
  const difficultyLabel = { easy: "简单", medium: "中等", hard: "费工夫" } as const;
  return <div className="space-y-5"><PageTitle title="今天吃什么" subtitle="不知道怎么吃？让系统帮你选。" action={<form action="/random" className="flex flex-wrap gap-2 items-center"><select className="field w-28" name="count" defaultValue={String(count)}><option value="1">1 道</option><option value="2">2 道</option><option value="3">3 道</option><option value="4">4 道</option><option value="5">5 道</option></select><select className="field w-36" name="categoryId" defaultValue={s.categoryId||""}><option value="">所有分类</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="field w-28" name="difficulty" defaultValue={s.difficulty||""}><option value="">全部难度</option><option value="easy">简单</option><option value="medium">中等</option><option value="hard">费工夫</option></select><select className="field w-28" name="chef" defaultValue={s.chef||""}><option value="">全部厨师</option>{CHEF_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select><button className="btn" type="submit">确认随机</button></form>} />
    {chosen.length ? <div className="space-y-4">{chosen.map((r, i) => <div key={r.id}><Link href={`/recipes/${r.id}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"><div className="relative flex aspect-[8/3] w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-6xl">{r.coverImageUrl ? <img src={r.coverImageUrl} alt="" className="h-full w-full object-cover" /> : <span className="opacity-60">🍳</span>}</div><div className="p-5"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white">{i + 1}</span><h3 className="text-2xl font-black text-orange-800">{r.title}</h3></div>{r.description && <p className="mt-2 line-clamp-2 muted">{r.description}</p>}<div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold text-orange-700">{r.categoryName && <span className="rounded-full bg-orange-100 px-3 py-1">{r.categoryName}</span>}<span className="rounded-full bg-orange-100 px-3 py-1">{difficultyLabel[r.difficulty] ?? r.difficulty}</span>{r.chef ? <span className="rounded-full bg-orange-100 px-3 py-1">👨‍🍳 {r.chef}</span> : null}{r.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-3 py-1">⏱ {r.cookTimeMinutes} 分钟</span> : null}</div></div></Link><div className="mt-2"><AddToMenuDialog recipeId={r.id} recipeTitle={r.title} /></div></div>)}</div> : <EmptyState>没有符合条件的菜谱，试试放宽筛选条件吧。</EmptyState>}
  </div>;
}
