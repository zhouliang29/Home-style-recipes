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

function filterRecipes<T extends RandomRecipeCandidate>(
  recipes: T[],
  filters: RandomRecipeFilters = {},
): T[] {
  const now = filters.now ?? new Date();
  const cutoff = filters.excludeRecentDays
    ? now.getTime() - filters.excludeRecentDays * 24 * 60 * 60 * 1000
    : null;

  return recipes.filter((recipe) => {
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
}

export function pickRandomRecipe<T extends RandomRecipeCandidate>(
  recipes: T[],
  filters: RandomRecipeFilters = {},
  random: () => number = Math.random,
): T | null {
  const candidates = filterRecipes(recipes, filters);
  if (candidates.length === 0) return null;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
}

export function pickRandomRecipes<T extends RandomRecipeCandidate>(
  recipes: T[],
  count: number,
  filters: RandomRecipeFilters = {},
  random: () => number = Math.random,
): T[] {
  const candidates = filterRecipes(recipes, filters);
  if (candidates.length === 0) return [];
  // Fisher-Yates 洗牌后取前 count 个
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
