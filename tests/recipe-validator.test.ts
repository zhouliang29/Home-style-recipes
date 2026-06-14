import { describe, expect, it } from "vitest";
import { recipeInputSchema } from "@/lib/validators/recipe";

describe("recipeInputSchema", () => {
  it("accepts a complete recipe with ingredients and steps", () => {
    const parsed = recipeInputSchema.parse({
      title: "番茄炒蛋",
      difficulty: "easy",
      chef: "周良",
      ingredients: [{ name: "番茄", amount: "2个", group: "main" }],
      steps: [{ content: "炒熟" }],
    });

    expect(parsed.title).toBe("番茄炒蛋");
    expect(parsed.chef).toBe("周良");
    expect(parsed.ingredients).toHaveLength(1);
  });

  it("rejects empty title with friendly validation error", () => {
    const result = recipeInputSchema.safeParse({ title: " ", difficulty: "easy", chef: "张幸", ingredients: [], steps: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("菜名不能为空");
    }
  });
});
