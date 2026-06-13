import Link from "next/link";
import type { RecipeSummary } from "@/lib/types";

const difficulty = { easy: "简单", medium: "中等", hard: "费工夫" } as const;

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-36 items-center justify-center bg-orange-100 text-5xl">
        {recipe.coverImageUrl ? <img src={recipe.coverImageUrl} alt="" className="h-full w-full object-cover" /> : "🍳"}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-black text-orange-800">{recipe.title}</h3>{recipe.isFavorite && <span>⭐</span>}</div>
        <p className="mt-1 line-clamp-2 text-sm muted">{recipe.description || "还没有简介"}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-orange-700">
          {recipe.categoryName && <span className="rounded-full bg-orange-100 px-2 py-1">{recipe.categoryName}</span>}
          <span className="rounded-full bg-orange-100 px-2 py-1">{difficulty[recipe.difficulty] ?? recipe.difficulty}</span>
          {recipe.cookTimeMinutes ? <span className="rounded-full bg-orange-100 px-2 py-1">{recipe.cookTimeMinutes} 分钟</span> : null}
        </div>
      </div>
    </Link>
  );
}
