import { describe, expect, it } from "vitest";
import { pickRandomRecipe } from "@/lib/random-recipe";

const now = new Date("2026-06-09T12:00:00Z");

describe("pickRandomRecipe", () => {
  it("filters archived recipes and recently cooked recipes", () => {
    const chosen = pickRandomRecipe(
      [
        { id: "archived", title: "旧菜", difficulty: "easy", cookTimeMinutes: 10, isArchived: true },
        { id: "recent", title: "昨天吃过", difficulty: "easy", cookTimeMinutes: 10, isArchived: false, lastCookedAt: new Date("2026-06-08T12:00:00Z") },
        { id: "fresh", title: "新菜", difficulty: "easy", cookTimeMinutes: 20, isArchived: false },
      ],
      { excludeRecentDays: 7, now },
      () => 0,
    );

    expect(chosen?.id).toBe("fresh");
  });

  it("returns null when no recipes match filters", () => {
    const chosen = pickRandomRecipe(
      [{ id: "hard", title: "大菜", difficulty: "hard", cookTimeMinutes: 90, isArchived: false }],
      { difficulty: "easy", maxCookTimeMinutes: 30, now },
      () => 0,
    );

    expect(chosen).toBeNull();
  });
});
