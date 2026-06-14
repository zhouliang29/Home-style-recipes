"use client";
import { useState } from "react";

export function DeleteRecipeButton({ recipeId, recipeTitle }: { recipeId: string; recipeTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsPending(true);
    try {
      const res = await fetch("/api/recipes/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      const data = await res.json();
      if (data.needLogin) {
        window.location.href = "/login";
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      window.location.href = "/recipes";
    } catch {
      setError("网络错误，请检查连接后重试");
    } finally {
      setIsPending(false);
    }
  }

  if (!confirming) {
    return (
      <button className="btn danger mobile-action w-full" type="button" onClick={() => setConfirming(true)}>
        🗑️ 删除菜谱
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4">
      <p className="font-bold text-red-700">确定要删除「{recipeTitle}」吗？删除后无法恢复。</p>
      {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
      <div className="flex gap-2">
        <button
          className="btn danger mobile-action flex-1"
          type="button"
          disabled={isPending}
          onClick={handleDelete}
        >
          {isPending ? "删除中..." : "确认删除"}
        </button>
        <button
          className="btn secondary mobile-action flex-1"
          type="button"
          onClick={() => { setConfirming(false); setError(null); }}
          disabled={isPending}
        >
          取消
        </button>
      </div>
    </div>
  );
}
