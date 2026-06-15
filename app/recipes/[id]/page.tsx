import { requireUser, canEditRecipe } from "@/lib/auth";
import { getRecipe } from "@/lib/recipes";
import { notFound } from "next/navigation";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { PageTitle } from "@/components/ui-blocks";
import Link from "next/link";

const difficulty = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export default async function RecipeDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const recipe = getRecipe(id, user.id);
  if (!recipe) notFound();
  return (
    <div className="space-y-6">
      <PageTitle
        title={recipe.title}
        subtitle={recipe.categoryName || undefined}
        action={<div className="flex gap-2">{canEditRecipe(user, recipe) ? <Link className="btn secondary" href={`/recipes/${id}/edit`}>✏️ 编辑</Link> : null}<Link className="btn secondary" href="/recipes">← 返回</Link></div>}
      />

      {/* 封面图 */}
      {recipe.coverImageUrl && (
        <div className="overflow-hidden rounded-3xl shadow-lg">
          <img src={recipe.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
        </div>
      )}

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 text-sm font-bold text-orange-700">
        <span className="rounded-full bg-orange-100 px-4 py-1.5">{difficulty[recipe.difficulty]}</span>
        {recipe.chef ? <span className="rounded-full bg-orange-100 px-4 py-1.5">👨‍🍳 {recipe.chef}</span> : null}
        {recipe.prepTimeMinutes ? <span className="rounded-full bg-orange-100 px-4 py-1.5">⏱ 准备 {recipe.prepTimeMinutes} 分钟</span> : null}
        {recipe.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-4 py-1.5">🔥 烹饪 {recipe.cookTimeMinutes} 分钟</span> : null}
        {recipe.servings ? <span className="rounded-full bg-orange-100 px-4 py-1.5">🍽 {recipe.servings} 份</span> : null}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3">
        <AddToMenuDialog recipeId={recipe.id} recipeTitle={recipe.title} />
      </div>

      {/* 简介 */}
      {recipe.description && <p className="muted text-lg leading-relaxed">{recipe.description}</p>}

      {/* 食材 */}
      <section className="card p-6">
        <h2 className="mb-4 text-xl font-black text-orange-700">🥬 食材</h2>
        {["main", "seasoning"].map((g) => {
          const items = recipe.ingredients.filter((i) => i.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-4 last:mb-0">
              <h3 className="mb-2 font-bold text-orange-600">{g === "main" ? "主料" : "调料"}</h3>
              <div className="rounded-2xl bg-orange-50/50 overflow-hidden">
                {items.map((i) => (
                  <div className="flex items-center justify-between border-b border-orange-100/60 px-4 py-2.5 last:border-0" key={i.id}>
                    <span className="font-medium">{i.name}</span>
                    <span className="muted">{i.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* 做法 */}
      <section className="card p-6">
        <h2 className="mb-4 text-xl font-black text-orange-700">👨‍🍳 做法</h2>
        <div className="space-y-5">
          {recipe.steps.map((s) => (
            <div className="flex gap-4" key={s.id}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white shadow-sm">
                {s.stepNumber}
              </span>
              <p className="pt-1 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 小贴士 */}
      {recipe.tips ? (
        <section className="card border-amber-200 bg-amber-50/80 p-6">
          <h2 className="mb-2 text-xl font-black text-amber-700">💡 小贴士</h2>
          <p className="muted leading-relaxed">{recipe.tips}</p>
        </section>
      ) : null}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-sm muted">
        <span>创建者：{recipe.createdByName || "未知"}</span>
        <span>更新于 {new Date(recipe.updatedAt).toLocaleDateString("zh-CN")}</span>
      </div>

      {/* 删除按钮 */}
      {canEditRecipe(user, recipe) && <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />}
    </div>
  );
}
