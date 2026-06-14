import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { saveRecipe } from "@/lib/recipes";
import { saveRecipeImage } from "@/lib/image-upload";
import { recipeInputSchema } from "@/lib/validators/recipe";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const formData = await request.formData();

    const raw = {
      title: formData.get("title") || "",
      description: formData.get("description") || "",
      categoryId: formData.get("categoryId") || null,
      difficulty: formData.get("difficulty") || "easy",
      chef: formData.get("chef") || null,
      prepTimeMinutes: formData.get("prepTimeMinutes"),
      cookTimeMinutes: formData.get("cookTimeMinutes"),
      servings: formData.get("servings"),
      tips: formData.get("tips") || "",
      ingredients: JSON.parse(String(formData.get("ingredients") || "[]")),
      steps: JSON.parse(String(formData.get("steps") || "[]")),
    };

    const input = recipeInputSchema.parse(raw);
    const coverImageUrl = await saveRecipeImage(formData.get("coverImage") as File | null);

    const recipeId = formData.get("id") as string | null;
    const id = saveRecipe({ ...input, id: recipeId || undefined, userId: user.id, coverImageUrl });

    revalidatePath("/recipes");
    revalidatePath("/");

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    if (e instanceof ZodError) {
      const first = e.issues[0];
      return NextResponse.json({ ok: false, error: first?.message || "输入验证失败" }, { status: 400 });
    }
    if (e && typeof e === "object" && "digest" in e) {
      // redirect() 异常 — 未登录
      const digest = String((e as { digest: unknown }).digest);
      if (digest.startsWith("NEXT_REDIRECT")) {
        return NextResponse.json({ ok: false, error: "请先登录", needLogin: true }, { status: 401 });
      }
    }
    const msg = e instanceof Error ? e.message : "保存失败，请重试";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
