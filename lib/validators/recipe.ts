import { z } from "zod";
import { CHEF_OPTIONS } from "@/lib/constants";
const positiveOptionalInt = z.coerce
  .number()
  .int("请输入整数")
  .positive("请输入正整数")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const recipeInputSchema = z.object({
  title: z.string().trim().min(1, "菜名不能为空").max(80, "菜名最多 80 字"),
  description: z.string().trim().optional().default(""),
  categoryId: z.string().trim().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"], { error: "请选择难度" }),
  chef: z.enum(CHEF_OPTIONS, { error: "请选择厨师" }),
  prepTimeMinutes: positiveOptionalInt,
  cookTimeMinutes: positiveOptionalInt,
  servings: positiveOptionalInt,
  tips: z.string().trim().optional().default(""),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1, "食材名称不能为空"),
        amount: z.string().trim().optional().default(""),
        group: z.enum(["main", "seasoning"]).default("main"),
      }),
    )
    .optional().default([]),
  steps: z
    .array(
      z.object({ content: z.string().trim().min(1, "步骤不能为空") }),
    )
    .optional().default([]),
});

export type RecipeInput = z.infer<typeof recipeInputSchema>;

export function parseLineItems(text: string, group: "main" | "seasoning") {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...amountParts] = line.split(/\s+/);
      return { name, amount: amountParts.join(" "), group };
    });
}

export function parseSteps(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((content) => ({ content }));
}
