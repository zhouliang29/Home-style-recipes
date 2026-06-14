export type RandomRecipeCandidate = {
  id: string;
  title: string;
  categoryId?: string | null;
  difficulty: "easy" | "medium" | "hard" | string;
  chef?: string | null;
  cookTimeMinutes?: number | null;
  isArchived: boolean;
  lastCookedAt?: Date | number | string | null;
};

export type RandomRecipeFilters = {
  categoryId?: string | null;
  difficulty?: "easy" | "medium" | "hard" | string | null;
  chef?: string | null;
  maxCookTimeMinutes?: number | null;
  excludeRecentDays?: number | null;
  now?: Date;
};

function toTime(value: Date | number | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function pickRandomRecipe<T extends RandomRecipeCandidate>(
  recipes: T[],
  filters: RandomRecipeFilters = {},
  random: () => number = Math.random,
): T | null {
  const now = filters.now ?? new Date();
  const cutoff = filters.excludeRecentDays
    ? now.getTime() - filters.excludeRecentDays * 24 * 60 * 60 * 1000
    : null;

  const candidates = recipes.filter((recipe) => {
    if (recipe.isArchived) return false;
    if (filters.categoryId && recipe.categoryId !== filters.categoryId) return false;
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
    if (filters.chef && recipe.chef !== filters.chef) return false;
    if (
      filters.maxCookTimeMinutes &&
      recipe.cookTimeMinutes != null &&
      recipe.cookTimeMinutes > filters.maxCookTimeMinutes
    ) {
      return false;
    }
    if (cutoff) {
      const cookedAt = toTime(recipe.lastCookedAt);
      if (cookedAt && cookedAt >= cutoff) return false;
    }
    return true;
  });

  if (candidates.length === 0) return null;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
}
