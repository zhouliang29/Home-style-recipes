"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RecipeSummary } from "@/lib/types";
import { generateMealOrderAction } from "@/app/meal-order/actions";
import { RecipeCard } from "@/components/recipe-card";

const STORAGE_KEY = "meal-order-selected";

export function RecipeOrderArea({ recipes, allRecipes }: { recipes: RecipeSummary[]; allRecipes: RecipeSummary[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false); // 默认折叠

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

  // 用全量查选中的菜（不受筛选影响）
  const selectedRecipes = allRecipes.filter((r) => selectedIds.has(r.id));

  async function handleGenerate() {
    if (selectedRecipes.length === 0) return;
    setSaving(true);
    try {
      const orderId = await generateMealOrderAction([...selectedIds]);
      setSelectedIds(new Set());
      setBasketOpen(false);
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
                className={`absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold shadow-lg backdrop-blur transition active:scale-90 ${
                  selected
                    ? "bg-orange-500 text-white ring-2 ring-orange-300"
                    : "bg-white/90 text-orange-600 ring-1 ring-orange-200"
                }`}
                aria-label={selected ? "取消点菜" : "点菜"}
              >
                {selected ? "✓" : "+"}
              </button>
            </div>
          );
        })}
      </div>

      {recipes.length === 0 && (
        <div className="card p-10 text-center">
          <div className="mb-3 text-5xl">🍽️</div>
          <div className="muted text-lg">没有找到菜谱。</div>
        </div>
      )}

      {/* 底部点菜篮：默认折叠成一条，点击展开；手机居中悬在导航栏上方，电脑端右下角 */}
      {selectedRecipes.length > 0 && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-3 lg:bottom-8 lg:justify-end lg:px-8">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_-8px_rgba(146,64,14,0.4)] ring-1 ring-orange-200">
            {/* 折叠条 */}
            <button
              type="button"
              onClick={() => setBasketOpen((v) => !v)}
              className="mobile-action flex w-full items-center justify-between gap-3 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white"
              aria-expanded={basketOpen}
            >
              <span className="flex items-center gap-2 font-black">
                <span className="text-lg">🧺</span> 点菜篮
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">{selectedRecipes.length} 道</span>
              </span>
              <span className={`text-sm transition-transform ${basketOpen ? "rotate-180" : ""}`}>▲</span>
            </button>

            {/* 展开面板 */}
            {basketOpen && (
              <div className="animate-fade-up">
                <div className="max-h-56 space-y-1.5 overflow-y-auto p-3">
                  {selectedRecipes.map((r) => (
                    <div key={r.id} className="flex items-center gap-2.5 rounded-xl bg-orange-50 p-1.5 pr-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 text-lg">
                        {r.coverImageUrl ? (
                          <img src={r.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>🍳</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-orange-800">{r.title}</span>
                        <span className="block truncate text-xs text-orange-500">
                          {[r.chef, r.categoryName].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(r.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm text-red-500 ring-1 ring-red-200 active:scale-90"
                        aria-label="移除"
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
                    className="btn secondary flex-1 py-2.5 text-sm"
                  >
                    清空
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={saving}
                    className="btn flex-[1.6] py-2.5 text-sm"
                  >
                    {saving ? "生成中…" : "🍽️ 生成本餐菜单"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
