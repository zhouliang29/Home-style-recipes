"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RecipeSummary } from "@/lib/types";
import { generateMealOrderAction } from "@/app/meal-order/actions";
import { RecipeCard } from "@/components/recipe-card";

const STORAGE_KEY = "meal-order-selected";

export function RecipeOrderArea({ recipes }: { recipes: RecipeSummary[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // 从 localStorage 恢复
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelectedIds(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  // 同步到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
  }, [selectedIds]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedRecipes = recipes.filter((r) => selectedIds.has(r.id));

  async function handleGenerate() {
    if (selectedRecipes.length === 0) return;
    setSaving(true);
    try {
      const orderId = await generateMealOrderAction([...selectedIds]);
      setSelectedIds(new Set());
      router.push(`/meal-order/${orderId}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="grid-cards">
        {recipes.map((r) => {
          const selected = selectedIds.has(r.id);
          return (
            <div key={r.id} className="relative">
              <RecipeCard recipe={r} />
              <button
                type="button"
                onClick={() => toggle(r.id)}
                className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold shadow-lg transition hover:scale-110 ${
                  selected
                    ? "bg-orange-500 text-white ring-2 ring-orange-300"
                    : "bg-white/90 text-orange-600 ring-1 ring-orange-300"
                }`}
                title={selected ? "取消点菜" : "点菜"}
              >
                {selected ? "✓" : "+"}
              </button>
            </div>
          );
        })}
      </div>

      {recipes.length === 0 && (
        <div className="card p-10 text-center">
          <div className="mb-4 text-5xl">🍽️</div>
          <div className="muted text-lg">没有找到菜谱。</div>
        </div>
      )}

      {/* 浮动点菜篮 */}
      {selectedRecipes.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-fade-up shadow-2xl lg:bottom-8">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white">
              <span className="font-black">📋 点菜篮</span>
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-sm font-bold">{selectedRecipes.length} 道菜</span>
            </div>
            <div className="max-h-56 space-y-1.5 overflow-y-auto p-3">
              {selectedRecipes.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-xl bg-orange-50 p-1.5 pr-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 text-lg">
                    {r.coverImageUrl ? (
                      <img src={r.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>🍳</span>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm font-bold text-orange-800">{r.title}</span>
                  <button
                    type="button"
                    onClick={() => toggle(r.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs text-red-500 ring-1 ring-red-200 hover:bg-red-50"
                    title="移除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-orange-100 bg-orange-50/80 p-3">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="btn secondary flex-1 py-2 text-sm"
              >
                清空
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={saving}
                className="btn flex-1 py-2 text-sm"
              >
                {saving ? "生成中…" : "🍽️ 生成本餐菜单"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
