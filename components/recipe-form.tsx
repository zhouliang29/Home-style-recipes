"use client";
import { useActionState, useState, useEffect } from "react";
import { createRecipe, updateRecipe } from "@/app/recipes/actions";
import { PageTitle } from "@/components/ui-blocks";
import type { Category, RecipeDetail } from "@/lib/types";

type IngItem = { name: string; amount: string; group: "main" | "seasoning" };
type StepItem = { content: string };

export function RecipeForm({ categories, recipe }: { categories: Category[]; recipe?: RecipeDetail; userId?: string }) {
  const isEdit = !!recipe;
  const [ingredients, setIngredients] = useState<IngItem[]>(
    recipe?.ingredients.map((i: { name: string; amount?: string | null; group: "main" | "seasoning" }) => ({ name: i.name, amount: i.amount || "", group: i.group })) || []
  );
  const [steps] = useState<StepItem[]>(
    recipe?.steps.map((s: { content: string }) => ({ content: s.content })) || []
  );
  const [stepText, setStepText] = useState(steps.map((s: { content: string }) => s.content).join("\n"));
  const [imagePreview, setImagePreview] = useState<string | null>(recipe?.coverImageUrl || null);

  // useActionState 捕获服务端错误，反馈给用户
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      try {
        formData.set("ingredients", JSON.stringify(ingredients.filter((i) => i.name.trim())));
        const stepLines = stepText.split("\n").map((s) => s.trim()).filter(Boolean);
        formData.set("steps", JSON.stringify(stepLines.map((content) => ({ content }))));
        if (isEdit) return await updateRecipe(recipe!.id, formData);
        return await createRecipe(formData);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "保存失败，请重试";
        return { error: message };
      }
    },
    null
  );

  function addIng(group: "main" | "seasoning") { setIngredients([...ingredients, { name: "", amount: "", group }]); }
  function updateIng(i: number, field: keyof IngItem, value: string) { const copy = [...ingredients]; copy[i] = { ...copy[i], [field]: value }; setIngredients(copy); }
  function removeIng(i: number) { setIngredients(ingredients.filter((_, idx) => idx !== i)); }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("图片不能超过 5MB，请压缩后重试");
      e.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("只支持 JPG、PNG、WebP 格式的图片");
      e.target.value = "";
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  // 错误时自动滚动到顶部
  useEffect(() => {
    if (state?.error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state?.error]);

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <PageTitle title={isEdit ? "编辑菜谱" : "新增菜谱"} />

      {/* 错误提示 */}
      {state?.error && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-center font-bold text-red-700">
          ⚠️ {state.error}
        </div>
      )}

      {/* 基本信息 */}
      <section className="card grid gap-4 p-5"><h2 className="font-black text-orange-700">基本信息</h2>
        <label className="label">菜名 <span className="text-red-500">*</span><input className="field" name="title" defaultValue={recipe?.title} required placeholder="例如：番茄炒蛋" /></label>
        <label className="label">简介<textarea className="field" name="description" defaultValue={recipe?.description || ""} rows={2} placeholder="简单描述这道菜" /></label>
        <label className="label">
          封面图
          <input className="field text-sm" name="coverImage" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleImageChange} />
          <span className="text-xs text-orange-400">支持 JPG/PNG/WebP，最大 5MB</span>
        </label>
        {imagePreview && (
          <div className="overflow-hidden rounded-2xl">
            <img src={imagePreview} alt="封面预览" className="aspect-video w-full object-cover" />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3"><label className="label">分类<select className="field" name="categoryId" defaultValue={recipe?.categoryId || ""}><option value="">不选</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="label">难度<select className="field" name="difficulty" defaultValue={recipe?.difficulty || "easy"}><option value="easy">简单</option><option value="medium">中等</option><option value="hard">费工夫</option></select></label>
        <label className="label">份量<input className="field" name="servings" type="number" min={1} defaultValue={recipe?.servings || ""} placeholder="2 人份" inputMode="numeric" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="label">准备时间（分钟）<input className="field" name="prepTimeMinutes" type="number" min={1} defaultValue={recipe?.prepTimeMinutes || ""} inputMode="numeric" /></label>
        <label className="label">烹饪时间（分钟）<input className="field" name="cookTimeMinutes" type="number" min={1} defaultValue={recipe?.cookTimeMinutes || ""} inputMode="numeric" /></label></div>
      </section>

      {/* 食材 - 手机优化布局 */}
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

      {/* 做法步骤 - 手机优化 */}
      <section className="card p-5 space-y-3"><h2 className="font-black text-orange-700">做法步骤 <span className="text-red-500 text-xl">*</span></h2>
        <textarea className="field min-h-[160px]" rows={8} placeholder={"每行一个步骤，例如：\n鸡蛋打散，加少许盐\n热锅凉油，炒熟鸡蛋盛出\n放入番茄翻炒出汁\n倒回鸡蛋翻炒均匀"} value={stepText} onChange={(e) => setStepText(e.target.value)} />
        <span className="text-xs text-orange-400">已输入 {stepText.split("\n").filter((s) => s.trim()).length} 个步骤</span>
      </section>

      {/* 小贴士 */}
      <section className="card grid gap-3 p-5"><h2 className="font-black text-orange-700">小贴士</h2>
        <textarea className="field" name="tips" defaultValue={recipe?.tips || ""} rows={2} placeholder="可选，比如关键火候、替代食材等" />
      </section>

      {/* 提交按钮 */}
      <button className="btn w-full py-4 text-lg" type="submit" disabled={isPending}>
        {isPending ? "保存中..." : isEdit ? "保存修改" : "创建菜谱"}
      </button>
    </form>
  );
}
