import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCategories, listRecipes } from "@/lib/recipes";
import { pickRandomRecipe } from "@/lib/random-recipe";
import { PageTitle, EmptyState } from "@/components/ui-blocks";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";
import { CHEF_OPTIONS } from "@/lib/constants";

export default async function RandomPage(props: { searchParams: Promise<{ categoryId?: string; difficulty?: string; chef?: string; excludeRecent?: string }> }) {
  const user = await requireUser();
  const s = await props.searchParams;
  const categories = getCategories();
  const excludeRecentDays = s.excludeRecent !== "false" ? 7 : null;
  const all = listRecipes({ userId: user.id });
  const now = new Date();
  const chosen = pickRandomRecipe(all.map((r) => ({ ...r, isArchived: false })), { categoryId: s.categoryId || null, difficulty: s.difficulty || null, chef: s.chef || null, excludeRecentDays, now });
  return <div className="space-y-5"><PageTitle title="今天吃什么" subtitle="不知道怎么吃？让系统帮你选一道。" action={<form action="/random" className="flex flex-wrap gap-2 items-center"><select className="field w-36" name="categoryId" defaultValue={s.categoryId||""}><option value="">所有分类</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="field w-28" name="difficulty" defaultValue={s.difficulty||""}><option value="">全部难度</option><option value="easy">简单</option><option value="medium">中等</option><option value="hard">费工夫</option></select><select className="field w-28" name="chef" defaultValue={s.chef||""}><option value="">全部厨师</option>{CHEF_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select><button className="btn" type="submit">选一道</button></form>} />
    {chosen ? <div className="space-y-4"><Link href={`/recipes/${chosen.id}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"><div className="relative flex aspect-[8/3] w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-6xl">{chosen.coverImageUrl ? <img src={chosen.coverImageUrl} alt="" className="h-full w-full object-cover" /> : <span className="opacity-60">🍳</span>}</div><div className="p-5"><h3 className="text-2xl font-black text-orange-800">{chosen.title}</h3>{chosen.description && <p className="mt-2 line-clamp-2 muted">{chosen.description}</p>}<div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold text-orange-700">{chosen.categoryName && <span className="rounded-full bg-orange-100 px-3 py-1">{chosen.categoryName}</span>}<span className="rounded-full bg-orange-100 px-3 py-1">{{easy:"简单",medium:"中等",hard:"费工夫"}[chosen.difficulty]??chosen.difficulty}</span>{chosen.chef ? <span className="rounded-full bg-orange-100 px-3 py-1">👨‍🍳 {chosen.chef}</span> : null}{chosen.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-3 py-1">⏱ {chosen.cookTimeMinutes} 分钟</span> : null}</div></div></Link><AddToMenuDialog recipeId={chosen.id} recipeTitle={chosen.title} /></div> : <EmptyState>没有符合条件的菜谱，试试放宽筛选条件吧。</EmptyState>}
  </div>;
}
