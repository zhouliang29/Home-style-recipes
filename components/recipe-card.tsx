import Link from "next/link";
import type { RecipeSummary } from "@/lib/types";

const difficulty = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-5xl">
        {recipe.coverImageUrl ? (
          <img src={recipe.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="opacity-60">🍳</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-black text-orange-800 line-clamp-1">{recipe.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm muted">{recipe.description || "还没有简介"}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold text-orange-700">
          {recipe.categoryName && <span className="rounded-full bg-orange-100 px-2.5 py-1">{recipe.categoryName}</span>}
          <span className="rounded-full bg-orange-100 px-2.5 py-1">{difficulty[recipe.difficulty] ?? recipe.difficulty}</span>
          {recipe.chef ? <span className="rounded-full bg-orange-100 px-2.5 py-1">👨‍🍳 {recipe.chef}</span> : null}
          {recipe.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-2.5 py-1">⏱ {recipe.cookTimeMinutes} 分钟</span> : null}
        </div>
      </div>
    </Link>
  );
}
