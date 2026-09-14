import { requireUser, canEditRecipe } from "@/lib/auth";
import { getRecipe } from "@/lib/recipes";
import { notFound } from "next/navigation";
import { AddToMenuDialog } from "@/components/add-to-menu-dialog";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import Link from "next/link";

const difficulty = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export default async function RecipeDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const recipe = getRecipe(id, user.id);
  if (!recipe) notFound();

  const metaTags = [
    { icon: "📊", text: difficulty[recipe.difficulty] },
    recipe.chef ? { icon: "👨‍🍳", text: recipe.chef } : null,
    recipe.prepTimeMinutes ? { icon: "🔪", text: `准备 ${recipe.prepTimeMinutes} 分` } : null,
    recipe.cookTimeMinutes ? { icon: "🔥", text: `烹饪 ${recipe.cookTimeMinutes} 分` } : null,
    recipe.servings ? { icon: "🍽", text: `${recipe.servings} 份` } : null,
  ].filter(Boolean) as { icon: string; text: string }[];

  return (
    <div className="space-y-5">
      {/* 顶部：返回 + 操作 */}
      <div className="flex items-center justify-between gap-2">
        <Link className="btn secondary py-2 text-sm" href="/recipes">← 菜谱</Link>
        <div className="flex gap-2">
          {canEditRecipe(user, recipe) && (
            <Link className="btn secondary py-2 text-sm" href={`/recipes/${id}/edit`}>✏️ 编辑</Link>
          )}
          {canEditRecipe(user, recipe) && <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />}
        </div>
      </div>

      {/* 封面 + 标题区 */}
      <header className="animate-fade-up">
        {recipe.coverImageUrl ? (
          <div className="overflow-hidden rounded-3xl shadow-[0_14px_36px_-14px_rgba(146,64,14,0.35)]">
            <img src={recipe.coverImageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 text-6xl">🍳</div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {recipe.categoryName && <span className="chip chip-active">{recipe.categoryName}</span>}
          {metaTags.map((t) => (
            <span key={t.text} className="chip">{t.icon} {t.text}</span>
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-orange-800 sm:text-3xl">{recipe.title}</h1>
        {recipe.description && <p className="mt-2 leading-relaxed muted">{recipe.description}</p>}
      </header>

      {/* 加入菜单 */}
      <div className="animate-fade-up animate-fade-up-delay-1">
        <AddToMenuDialog recipeId={recipe.id} recipeTitle={recipe.title} />
      </div>

      {/* 食材 */}
      <section className="card animate-fade-up animate-fade-up-delay-1 p-5 sm:p-6">
        <h2 className="section-title mb-4">🥬 食材</h2>
        {["main", "seasoning"].map((g) => {
          const items = recipe.ingredients.filter((i) => i.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-4 last:mb-0">
              <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-orange-500">{g === "main" ? "主料" : "调料"}</h3>
              <div className="overflow-hidden rounded-2xl bg-orange-50/60 ring-1 ring-orange-100/70">
                {items.map((i) => (
                  <div className="flex items-center justify-between gap-3 border-b border-orange-100/60 px-4 py-2.5 last:border-0" key={i.id}>
                    <span className="font-medium">{i.name}</span>
                    <span className="shrink-0 text-sm muted">{i.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {!recipe.ingredients.length && <p className="muted">还没有记录食材。</p>}
      </section>

      {/* 做法 */}
      <section className="card animate-fade-up animate-fade-up-delay-2 p-5 sm:p-6">
        <h2 className="section-title mb-5">👨‍🍳 做法</h2>
        <div className="relative space-y-5">
          {recipe.steps.length > 0 && (
            <div className="absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-orange-200 via-orange-200 to-transparent" aria-hidden />
          )}
          {recipe.steps.map((s) => (
            <div className="relative flex gap-3.5" key={s.id}>
              <span className="step-badge relative z-10">{s.stepNumber}</span>
              <p className="pt-1 leading-relaxed">{s.content}</p>
            </div>
          ))}
          {!recipe.steps.length && <p className="muted">还没有步骤。</p>}
        </div>
      </section>

      {/* 小贴士 */}
      {recipe.tips ? (
        <section className="card animate-fade-up animate-fade-up-delay-3 border-amber-200 bg-amber-50/80 p-5 sm:p-6">
          <h2 className="section-title mb-2 text-amber-700">💡 小贴士</h2>
          <p className="leading-relaxed text-amber-900/80">{recipe.tips}</p>
        </section>
      ) : null}

      {/* 底部信息 */}
      <div className="flex items-center justify-between pb-2 text-sm muted">
        <span>创建者：{recipe.createdByName || "未知"}</span>
        <span>更新于 {new Date(recipe.updatedAt).toLocaleDateString("zh-CN")}</span>
      </div>
    </div>
  );
}
