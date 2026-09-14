import Link from "next/link";
import type { RecipeSummary } from "@/lib/types";

const difficulty = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="card card-hover block overflow-hidden"
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-4xl sm:h-40 sm:text-5xl">
        {recipe.coverImageUrl ? (
          <img src={recipe.coverImageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="opacity-60">🍳</span>
        )}
        {recipe.categoryName && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-orange-700 shadow-sm backdrop-blur sm:text-xs">
            {recipe.categoryName}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-base font-black text-orange-900 line-clamp-1 sm:text-lg">{recipe.title}</h3>
        <p className="mt-1 hidden line-clamp-2 text-sm muted sm:block">{recipe.description || "还没有简介"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] font-bold text-orange-700 sm:text-xs">
          <span className="rounded-full bg-orange-100 px-2 py-0.5">{difficulty[recipe.difficulty] ?? recipe.difficulty}</span>
          {recipe.chef ? <span className="rounded-full bg-orange-100 px-2 py-0.5">👨‍🍳 {recipe.chef}</span> : null}
          {recipe.cookTimeMinutes ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5">⏱ {recipe.cookTimeMinutes}分</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
