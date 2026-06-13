import { requireUser, canEditRecipe } from "@/lib/auth";
import { getRecipe } from "@/lib/recipes";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { CookedButton } from "@/components/cooked-button";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";
import { PageTitle } from "@/components/ui-blocks";
import Link from "next/link";

const difficulty = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export default async function RecipeDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const recipe = getRecipe(id, user.id);
  if (!recipe) notFound();
  return <div className="space-y-5"><PageTitle title={recipe.title} subtitle={recipe.categoryName || undefined} action={canEditRecipe(user, recipe) ? <Link className="btn secondary" href={`/recipes/${id}/edit`}>编辑</Link> : undefined} />
    {recipe.coverImageUrl && <img src={recipe.coverImageUrl} alt="" className="aspect-video w-full rounded-3xl object-cover" />}
    <div className="flex flex-wrap gap-2 text-sm font-bold text-orange-700"><span className="rounded-full bg-orange-100 px-3 py-1">{difficulty[recipe.difficulty]}</span>{recipe.prepTimeMinutes ? <span className="rounded-full bg-orange-100 px-3 py-1">准备 {recipe.prepTimeMinutes} 分钟</span> : null}{recipe.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-3 py-1">烹饪 {recipe.cookTimeMinutes} 分钟</span> : null}{recipe.servings ? <span className="rounded-full bg-orange-100 px-3 py-1">{recipe.servings} 份</span> : null}</div>
    <div className="flex gap-3">
      <FavoriteButton recipeId={recipe.id} initialFavorite={recipe.isFavorite} />
      <CookedButton recipeId={recipe.id} />
      <AddToMenuDialog recipeId={recipe.id} recipeTitle={recipe.title} />
    </div>
    {recipe.description && <p className="muted">{recipe.description}</p>}
    <section className="card p-5"><h2 className="mb-3 font-black text-orange-700">食材</h2>
      {["main", "seasoning"].map((g) => { const items = recipe.ingredients.filter((i) => i.group === g); if (!items.length) return null; return <div key={g} className="mb-3"><h3 className="mb-1 font-bold text-orange-600">{g==="main"?"主料":"调料"}</h3>{items.map((i) => <div className="flex items-center justify-between border-b border-orange-100 py-2 last:border-0" key={i.id}><span>{i.name}</span><span className="muted">{i.amount}</span></div>)}</div>; })}
    </section>
    <section className="card p-5"><h2 className="mb-3 font-black text-orange-700">做法</h2>
      {recipe.steps.map((s) => <div className="mb-4 flex gap-3 last:mb-0" key={s.id}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white">{s.stepNumber}</span><p className="pt-1">{s.content}</p></div>)}
    </section>
    {recipe.tips ? <section className="card p-5"><h2 className="mb-2 font-black text-orange-700">小贴士</h2><p className="muted">{recipe.tips}</p></section> : null}
    <p className="muted text-sm">创建者：{recipe.createdByName || "未知"} · 更新于 {new Date(recipe.updatedAt).toLocaleDateString("zh-CN")}</p>
  </div>;
}
