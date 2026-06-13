import { describe, expect, it } from "vitest";
import { recipeInputSchema } from "@/lib/validators/recipe";

describe("recipeInputSchema", () => {
  it("accepts a complete recipe with ingredients and steps", () => {
    const parsed = recipeInputSchema.parse({
      title: "番茄炒蛋",
      difficulty: "easy",
      ingredients: [{ name: "番茄", amount: "2个", group: "main" }],
      steps: [{ content: "炒熟" }],
    });

    expect(parsed.title).toBe("番茄炒蛋");
    expect(parsed.ingredients).toHaveLength(1);
  });

  it("rejects empty title and missing steps with friendly validation errors", () => {
    const result = recipeInputSchema.safeParse({ title: " ", difficulty: "easy", ingredients: [], steps: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("菜名不能为空");
      expect(messages).toContain("至少添加一个步骤");
    }
  });
});
