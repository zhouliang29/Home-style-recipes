"use client";
import { useActionState, useState, useEffect } from "react";
import { archiveRecipeAction } from "@/app/recipes/actions";

export function DeleteRecipeButton({ recipeId, recipeTitle }: { recipeId: string; recipeTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  type DeleteState = { ok?: boolean; error?: string } | null;
  const [state, formAction, isPending] = useActionState(
    async (_prev: DeleteState, _formData: FormData): Promise<DeleteState> => {
      try {
        return (await archiveRecipeAction(recipeId)) as DeleteState;
      } catch (e: unknown) {
        // redirect() 异常需要重新抛出
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
        if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) throw e;
        return { error: e instanceof Error ? e.message : "删除失败" };
      }
    },
    null as DeleteState
  );

  useEffect(() => {
    if (state?.ok) window.location.href = "/recipes";
  }, [state]);

  if (!confirming) {
    return (
      <button className="btn danger w-full" type="button" onClick={() => setConfirming(true)}>
        🗑️ 删除菜谱
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4">
      <p className="font-bold text-red-700">确定要删除「{recipeTitle}」吗？删除后无法恢复。</p>
      {state?.error && <p className="text-sm text-red-600">⚠️ {state.error}</p>}
      <div className="flex gap-2">
        <button className="btn danger flex-1" type="submit" disabled={isPending}>
          {isPending ? "删除中..." : "确认删除"}
        </button>
        <button className="btn secondary flex-1" type="button" onClick={() => setConfirming(false)} disabled={isPending}>
          取消
        </button>
      </div>
    </form>
  );
}
