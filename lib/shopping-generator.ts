export type IngredientForShopping = {
  name: string;
  amount?: string | null;
  group?: "main" | "seasoning" | string | null;
};

export type RecipeForShopping = {
  recipeTitle: string;
  ingredients: IngredientForShopping[];
};

export type GeneratedShoppingItem = {
  name: string;
  amount: string;
  category: string;
};

export function generateShoppingItems(
  recipes: RecipeForShopping[],
  options: { includeSeasoning?: boolean } = {},
): GeneratedShoppingItem[] {
  const merged = new Map<string, string[]>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const name = ingredient.name.trim();
      if (!name) continue;
      if (!options.includeSeasoning && ingredient.group === "seasoning") continue;
      const amounts = merged.get(name) ?? [];
      if (ingredient.amount?.trim()) amounts.push(ingredient.amount.trim());
      merged.set(name, amounts);
    }
  }

  return Array.from(merged.entries()).map(([name, amounts]) => ({
    name,
    amount: amounts.join(" + "),
    category: "食材",
  }));
}
