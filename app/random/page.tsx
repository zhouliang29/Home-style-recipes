import { requireUser } from "@/lib/auth";
import { getCategories, listRecipes } from "@/lib/recipes";
import { pickRandomRecipe } from "@/lib/random-recipe";
import { PageTitle, EmptyState } from "@/components/ui-blocks";
import { RecipeCard } from "@/components/recipe-card";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";

export default async function RandomPage(props: { searchParams: Promise<{ categoryId?: string; difficulty?: string; maxTime?: string; excludeRecent?: string }> }) {
  const user = await requireUser();
  const s = await props.searchParams;
  const categories = getCategories();
  const excludeRecentDays = s.excludeRecent !== "false" ? 7 : null;
  const all = listRecipes({ userId: user.id });
  const now = new Date();
  const chosen = pickRandomRecipe(all.map((r) => ({ ...r, isArchived: false })), { categoryId: s.categoryId || null, difficulty: s.difficulty || null, maxCookTimeMinutes: s.maxTime ? Number(s.maxTime) : null, excludeRecentDays, now });
  return <div className="space-y-5"><PageTitle title="今天吃什么" subtitle="不知道怎么吃？让系统帮你选一道。" action={<form action="/random" className="flex flex-wrap gap-2 items-center"><select className="field w-36" name="categoryId"><option value="">所有分类</option>{categories.map((c) => <option key={c.id} value={c.id} selected={c.id===s.categoryId}>{c.name}</option>)}</select><select className="field w-28" name="difficulty"><option value="">全部难度</option><option value="easy" selected={s.difficulty==="easy"}>简单</option><option value="medium" selected={s.difficulty==="medium"}>中等</option><option value="hard" selected={s.difficulty==="hard"}>费工夫</option></select><input className="field w-28" name="maxTime" type="number" placeholder="最多分钟" defaultValue={s.maxTime||""} /><button className="btn" type="submit">选一道</button></form>} />
    {chosen ? <div><RecipeCard recipe={chosen} /><br/><AddToMenuDialog recipeId={chosen.id} recipeTitle={chosen.title} /></div> : <EmptyState>没有符合条件的菜谱，试试放宽筛选条件吧。</EmptyState>}
  </div>;
}
