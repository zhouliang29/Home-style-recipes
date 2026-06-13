import { describe, expect, it } from "vitest";
import { generateShoppingItems } from "@/lib/shopping-generator";

describe("generateShoppingItems", () => {
  it("merges main ingredients with the same name and excludes seasoning by default", () => {
    const items = generateShoppingItems([
      { recipeTitle: "番茄炒蛋", ingredients: [
        { name: "番茄", amount: "2个", group: "main" },
        { name: "盐", amount: "少许", group: "seasoning" },
      ] },
      { recipeTitle: "番茄汤", ingredients: [
        { name: "番茄", amount: "3个", group: "main" },
        { name: "鸡蛋", amount: "2个", group: "main" },
      ] },
    ]);

    expect(items).toEqual([
      { name: "番茄", amount: "2个 + 3个", category: "食材" },
      { name: "鸡蛋", amount: "2个", category: "食材" },
    ]);
  });
});
