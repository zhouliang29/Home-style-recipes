"use client";
import { useState, useEffect } from "react";
import type { Category } from "@/lib/types";
import { createCategoryAction, renameCategoryAction, deleteCategoryAction, countRecipesInCategoryAction } from "@/app/recipes/actions";

export function ManageCategoryDialog({ categories, onCategoriesChange }: {
  categories: Category[];
  onCategoriesChange: (next: Category[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setEditingId(null);
    setError(null);
    setNewName("");
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) { setError("名称不能为空"); return; }
    setBusy(true);
    const result = await createCategoryAction(name);
    setBusy(false);
    if ("error" in result) { setError(result.error); return; }
    onCategoriesChange([...categories, { id: result.id, name: result.name, icon: null, sortOrder: 9999 }]);
    setNewName("");
    setError(null);
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditingName(c.name);
    setError(null);
  }

  async function handleRename() {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) { setError("名称不能为空"); return; }
    setBusy(true);
    const result = await renameCategoryAction(editingId, name);
    setBusy(false);
    if ("error" in result) { setError(result.error); return; }
    onCategoriesChange(categories.map((c) => (c.id === editingId ? { ...c, name } : c)));
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(c: Category) {
    if (!confirm(`确定删除分类「${c.name}」？\n该分类下的菜谱会变为未分类。`)) return;
    setBusy(true);
    const result = await deleteCategoryAction(c.id);
    setBusy(false);
    if ("error" in result) { setError(result.error); return; }
    onCategoriesChange(categories.filter((x) => x.id !== c.id));
    setError(null);
  }

  async function recipeCount(id: string): Promise<string> {
    const n = await countRecipesInCategoryAction(id);
    return n ? `${n} 道菜` : "无菜谱";
  }

  return (
    <>
      <button
        type="button"
        className="btn secondary shrink-0 px-3 text-sm"
        onClick={() => setOpen(true)}
      >
        管理分类
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={close}>
          <div
            className="max-h-[82vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-orange-700">🗂 管理分类</h3>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-orange-400 transition hover:bg-orange-50" onClick={close} aria-label="关闭">✕</button>
            </div>

            {/* 新增 */}
            <div className="mb-4 flex gap-2">
              <input
                className="field flex-1"
                placeholder="新分类名称，如：凉菜"
                value={newName}
                maxLength={20}
                onChange={(e) => { setNewName(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              />
              <button className="btn shrink-0 px-4 text-sm" disabled={busy} onClick={handleAdd}>➕ 新增</button>
            </div>

            {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</div>}

            {/* 分类列表 */}
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="rounded-2xl bg-orange-50/70 p-2.5">
                  {editingId === c.id ? (
                    <div className="flex gap-2">
                      <input
                        className="field flex-1 !py-1.5 text-sm"
                        value={editingName}
                        maxLength={20}
                        autoFocus
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRename(); } }}
                      />
                      <button className="btn shrink-0 px-3 py-1.5 text-xs" disabled={busy} onClick={handleRename}>保存</button>
                      <button className="btn secondary shrink-0 px-3 py-1.5 text-xs" onClick={() => setEditingId(null)}>取消</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-bold text-orange-900">{c.name}</span>
                      <CategoryCount categoryId={c.id} loader={recipeCount} />
                      <button className="btn secondary shrink-0 px-3 py-1.5 text-xs" onClick={() => startEdit(c)}>✏️ 改名</button>
                      <button className="btn danger shrink-0 px-3 py-1.5 text-xs" disabled={busy} onClick={() => handleDelete(c)}>🗑 删除</button>
                    </div>
                  )}
                </div>
              ))}
              {categories.length === 0 && <p className="py-4 text-center text-sm text-orange-400">还没有分类，先新增一个吧</p>}
            </div>

            <p className="mt-3 text-xs text-orange-400">删除分类不会删除菜谱，分类下的菜谱会自动变为「未分类」。</p>
          </div>
        </div>
      )}
    </>
  );
}

function CategoryCount({ categoryId, loader }: { categoryId: string; loader: (id: string) => Promise<string> }) {
  const [text, setText] = useState("…");
  useEffect(() => {
    let alive = true;
    loader(categoryId).then((t) => { if (alive) setText(t); });
    return () => { alive = false; };
  }, [categoryId, loader]);
  return <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-500 ring-1 ring-orange-100">{text}</span>;
}
