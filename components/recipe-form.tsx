"use client";
import { useState, useRef } from "react";
import { PageTitle } from "@/components/ui-blocks";
import { CHEF_OPTIONS } from "@/lib/constants";
import type { Category, RecipeDetail } from "@/lib/types";
import { createCategoryAction } from "@/app/recipes/actions";

type IngItem = { name: string; amount: string; group: "main" | "seasoning" };

function fileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 客户端判断图片类型，兼容 Android file.type 为空的情况 */
function isImageType(file: File): { ok: boolean; msg?: string } {
  const mimeType = file.type;
  if (mimeType && ["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return { ok: true };
  if (!mimeType && file.name) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp"].includes(ext)) return { ok: true };
  }
  if (mimeType) return { ok: false, msg: `不支持 ${mimeType}，只支持 JPG、PNG、WebP` };
  return { ok: false, msg: "无法识别图片格式，请选择 JPG、PNG 或 WebP 图片" };
}

export function RecipeForm({ categories, recipe }: { categories: Category[]; recipe?: RecipeDetail; userId?: string }) {
  const isEdit = !!recipe;
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [ingredients, setIngredients] = useState<IngItem[]>(
    recipe?.ingredients.map((i: { name: string; amount?: string | null; group: "main" | "seasoning" }) => ({ name: i.name, amount: i.amount || "", group: i.group })) || []
  );
  const [stepText, setStepText] = useState(
    recipe?.steps.map((s: { content: string }) => s.content).join("\n") || ""
  );
  const [imagePreview, setImagePreview] = useState<string | null>(recipe?.coverImageUrl || null);
  const [imageFile, setImageFile] = useState<{ name: string; size: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState(categories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  function addIng(group: "main" | "seasoning") { setIngredients([...ingredients, { name: "", amount: "", group }]); }
  function updateIng(i: number, field: keyof IngItem, value: string) { const copy = [...ingredients]; copy[i] = { ...copy[i], [field]: value }; setIngredients(copy); }
  function removeIng(i: number) { setIngredients(ingredients.filter((_, idx) => idx !== i)); }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setImageFile(null); setImageError(null); return; }

    setImageFile({ name: file.name, size: fileSizeDisplay(file.size) });
    setImageError(null);

    if (file.size > 5 * 1024 * 1024) {
      setImageError(`图片 ${fileSizeDisplay(file.size)}，超过 5MB 限制，请压缩后重试`);
      e.target.value = "";
      setImagePreview(null);
      return;
    }
    const typeCheck = isImageType(file);
    if (!typeCheck.ok) {
      setImageError(typeCheck.msg || "不支持该图片格式");
      e.target.value = "";
      setImagePreview(null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  // 用 fetch POST 到 API Route — 所有浏览器 100% 兼容
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const form = formRef.current;
    if (!form) return;

    // 客户端校验菜名
    const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');
    if (titleInput && !titleInput.value.trim()) {
      setSubmitError("菜名不能为空");
      titleInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const formData = new FormData(form);
    formData.set("ingredients", JSON.stringify(ingredients.filter((i) => i.name.trim())));
    formData.set("steps", JSON.stringify(stepText.split("\n").map(s => s.trim()).filter(Boolean).map(c => ({ content: c }))));
    if (isEdit && recipe) formData.set("id", recipe.id);

    setIsPending(true);
    try {
      const res = await fetch("/api/recipes", { method: "POST", body: formData });
      const data = await res.json();

      if (data.needLogin) {
        window.location.href = "/login";
        return;
      }
      if (data.error) {
        setSubmitError(data.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // 成功
      setSubmitSuccess(true);
      if (isEdit && recipe) {
        window.location.href = `/recipes/${recipe.id}`;
      } else if (data.id) {
        window.location.href = `/recipes/${data.id}`;
      } else {
        window.location.href = "/recipes";
      }
    } catch (err) {
      setSubmitError("网络错误，请检查连接后重试");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
      <PageTitle title={isEdit ? "编辑菜谱" : "新增菜谱"} />

      {/* 错误提示 */}
      {submitError && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-center font-bold text-red-700">
          ⚠️ {submitError}
        </div>
      )}

      {/* 成功提示 */}
      {submitSuccess && (
        <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4 text-center font-bold text-green-700">
          ✅ 保存成功，正在跳转…
        </div>
      )}

      {/* 基本信息 */}
      <section className="card grid gap-4 p-5"><h2 className="font-black text-orange-700">基本信息</h2>
        <label className="label">菜名 <span className="text-red-500">*</span><input className="field" name="title" defaultValue={recipe?.title} placeholder="例如：番茄炒蛋" /></label>
        <label className="label">简介<textarea className="field" name="description" defaultValue={recipe?.description || ""} rows={2} placeholder="简单描述这道菜" /></label>
        <label className="label">封面图（选填）
          <input className="field text-sm" name="coverImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          {imageFile && !imageError && (
            <span className="text-xs text-green-600">📎 {imageFile.name}（{imageFile.size}）</span>
          )}
          {imageError && (
            <span className="text-xs text-red-600">❌ {imageError}</span>
          )}
          {!imageFile && !imageError && (
            <span className="text-xs text-orange-400">支持 JPG/PNG/WebP，最大 5MB，不选则无封面图</span>
          )}
        </label>
        {imagePreview && (
          <div className="overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="封面预览" className="aspect-video w-full object-cover" />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3"><label className="label">分类
          <div className="flex gap-2">
            <select className="field flex-1" name="categoryId" defaultValue={recipe?.categoryId || ""}><option value="">不选</option>{categoryList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <button type="button" className="btn secondary shrink-0 px-3 text-sm" onClick={() => { setShowAddCategory(true); setTimeout(() => categoryInputRef.current?.focus(), 50); }} title="添加分类">+</button>
          </div>
          {showAddCategory && <div className="mt-1 flex gap-2">
            <input ref={categoryInputRef} className="field flex-1 text-sm" value={newCategoryName} onChange={(e) => { setNewCategoryName(e.target.value); setCategoryError(null); }} placeholder="新分类名称" maxLength={20} />
            <button type="button" className="btn shrink-0 px-3 text-sm" onClick={async () => {
              const name = newCategoryName.trim();
              if (!name) { setCategoryError("名称不能为空"); return; }
              const result = await createCategoryAction(name);
              if ("error" in result) { setCategoryError(result.error); return; }
              setCategoryList([...categoryList, { id: result.id, name: result.name }]);
              setNewCategoryName("");
              setShowAddCategory(false);
              setCategoryError(null);
            }}>确定</button>
            <button type="button" className="btn secondary shrink-0 px-3 text-sm" onClick={() => { setShowAddCategory(false); setNewCategoryName(""); setCategoryError(null); }}>取消</button>
          </div>}
          {categoryError && <span className="text-xs text-red-500">{categoryError}</span>}
        </label>
        <label className="label">难度<select className="field" name="difficulty" defaultValue={recipe?.difficulty || "easy"}><option value="easy">简单</option><option value="medium">中等</option><option value="hard">费工夫</option></select></label>
        <label className="label">厨师 <span className="text-red-500">*</span><select className="field" name="chef" defaultValue={recipe?.chef || ""}><option value="">请选择</option>{CHEF_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></label></div>
        <div className="grid gap-4 sm:grid-cols-3"><label className="label">准备时间（分钟）<input className="field" name="prepTimeMinutes" type="number" min={1} defaultValue={recipe?.prepTimeMinutes || ""} inputMode="numeric" /></label>
        <label className="label">烹饪时间（分钟）<input className="field" name="cookTimeMinutes" type="number" min={1} defaultValue={recipe?.cookTimeMinutes || ""} inputMode="numeric" /></label>
        <label className="label">份量<input className="field" name="servings" type="number" min={1} defaultValue={recipe?.servings || ""} placeholder="2 人份" inputMode="numeric" /></label></div>
      </section>

      {/* 食材 */}
      <section className="card p-5 space-y-3"><h2 className="font-black text-orange-700">食材（选填）</h2>
        {ingredients.map((item, i) => (
          <div className="grid gap-2 rounded-2xl bg-orange-50/60 p-3 sm:flex sm:gap-2 sm:bg-transparent sm:p-0" key={i}>
            <div className="flex gap-2">
              <select className="field w-20 shrink-0 sm:w-28" value={item.group} onChange={(e) => updateIng(i, "group", e.target.value)}><option value="main">主料</option><option value="seasoning">调料</option></select>
              <input className="field flex-1" placeholder="名称" value={item.name} onChange={(e) => updateIng(i, "name", e.target.value)} />
            </div>
            <div className="flex gap-2">
              <input className="field flex-1 sm:w-28" placeholder="用量" value={item.amount} onChange={(e) => updateIng(i, "amount", e.target.value)} />
              <button type="button" className="btn danger shrink-0 px-3" onClick={() => removeIng(i)}>✕</button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2"><button type="button" className="btn secondary" onClick={() => addIng("main")}>+ 添加主料</button><button type="button" className="btn secondary" onClick={() => addIng("seasoning")}>+ 添加调料</button></div>
      </section>

      {/* 做法步骤 */}
      <section className="card p-5 space-y-3"><h2 className="font-black text-orange-700">做法步骤（选填）</h2>
        <textarea className="field min-h-[160px]" rows={8} placeholder={"每行一个步骤，例如：\n鸡蛋打散，加少许盐\n热锅凉油，炒熟鸡蛋盛出\n放入番茄翻炒出汁\n倒回鸡蛋翻炒均匀"} value={stepText} onChange={(e) => setStepText(e.target.value)} />
        <span className="text-xs text-orange-400">已输入 {stepText.split("\n").filter((s) => s.trim()).length} 个步骤</span>
      </section>

      {/* 小贴士 */}
      <section className="card grid gap-3 p-5"><h2 className="font-black text-orange-700">小贴士</h2>
        <textarea className="field" name="tips" defaultValue={recipe?.tips || ""} rows={2} placeholder="可选，比如关键火候、替代食材等" />
      </section>

      {/* 提交按钮 — mobile-action 确保 touch 响应 */}
      <button
        className={`btn mobile-action w-full py-4 text-lg ${isPending ? "opacity-60" : ""}`}
        type="submit"
        disabled={isPending || submitSuccess}
      >
        {isPending ? "保存中…" : isEdit ? "保存修改" : "创建菜谱"}
      </button>
    </form>
  );
}
