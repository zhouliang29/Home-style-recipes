import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { archiveRecipe } from "@/lib/recipes";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const { recipeId } = await request.json();
    if (!recipeId) return NextResponse.json({ ok: false, error: "缺少 recipeId" }, { status: 400 });
    archiveRecipe(recipeId);
    revalidatePath("/recipes");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) {
      const digest = String((e as { digest: unknown }).digest);
      if (digest.startsWith("NEXT_REDIRECT")) {
        return NextResponse.json({ ok: false, error: "请先登录", needLogin: true }, { status: 401 });
      }
    }
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "删除失败" }, { status: 500 });
  }
}
