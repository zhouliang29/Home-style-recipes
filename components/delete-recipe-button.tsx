"use client";
import { useState } from "react";
import { archiveRecipeAction } from "@/app/recipes/actions";

export function DeleteRecipeButton({ recipeId, recipeTitle }: { recipeId: string; recipeTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteAction = archiveRecipeAction.bind(null, recipeId);

  if (confirming) {
    return (
      <form action={deleteAction} onSubmit={() => setDeleting(true)} className="space-y-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4">
        <p className="font-bold text-red-700">确定要删除「{recipeTitle}」吗？删除后无法恢复。</p>
        <div className="flex gap-2">
          <button className="btn danger mobile-action flex-1" type="submit" disabled={deleting}>
            {deleting ? "删除中..." : "确认删除"}
          </button>
          <button className="btn secondary mobile-action flex-1" type="button" onClick={() => setConfirming(false)} disabled={deleting}>
            取消
          </button>
        </div>
      </form>
    );
  }

  return (
    <button className="btn danger mobile-action w-full" type="button" onClick={() => setConfirming(true)}>
      🗑️ 删除菜谱
    </button>
  );
}
