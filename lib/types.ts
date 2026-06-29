export type User = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "member";
};

export type Category = { id: string; name: string; icon?: string | null; sortOrder?: number };

export type RecipeSummary = {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  difficulty: "easy" | "medium" | "hard";
  chef?: string | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings?: number | null;
  isFavorite?: boolean;
  lastCookedAt?: number | null;
  updatedAt: number;
};

export type MealOrder = {
  id: string;
  totalCount: number;
  createdById: string;
  createdAt: number;
};

export type MealOrderItem = {
  id: string;
  mealOrderId: string;
  recipeId: string;
  recipeTitle: string;
  coverImageUrl?: string | null;
  chef?: string | null;
  categoryName?: string | null;
  sortOrder: number;
};

export type RecipeDetail = RecipeSummary & {
  tips?: string | null;
  createdById: string;
  createdByName?: string | null;
  ingredients: { id: string; name: string; amount?: string | null; group: "main" | "seasoning"; sortOrder: number }[];
  steps: { id: string; stepNumber: number; content: string; imageUrl?: string | null }[];
};
