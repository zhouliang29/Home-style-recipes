"use client";
import { useState } from "react";
import { archiveRecipeAction } from "@/app/recipes/actions";
import { useRouter } from "next/navigation";

export function DeleteRecipeButton({ recipeId, recipeTitle }: { recipeId: string; recipeTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    await archiveRecipeAction(recipeId);
    router.push("/recipes");
  }

  if (confirming) {
    return (
      <div className="space-y-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4">
        <p className="font-bold text-red-700">确定要删除「{recipeTitle}」吗？删除后无法恢复。</p>
        <div className="flex gap-2">
          <button className="btn danger flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting ? "删除中..." : "确认删除"}
          </button>
          <button className="btn secondary flex-1" onClick={() => setConfirming(false)} disabled={deleting}>
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <button className="btn danger w-full" onClick={() => setConfirming(true)}>
      🗑️ 删除菜谱
    </button>
  );
}
