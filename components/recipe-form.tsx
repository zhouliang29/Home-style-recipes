"use client";
import { useState } from "react";
import { createRecipe, updateRecipe } from "@/app/recipes/actions";
import { PageTitle } from "@/components/ui-blocks";
import type { Category, RecipeDetail } from "@/lib/types";

type IngItem = { name: string; amount: string; group: "main" | "seasoning" };
type StepItem = { content: string };

export function RecipeForm({ categories, recipe }: { categories: Category[]; recipe?: RecipeDetail; userId?: string }) {
  const isEdit = !!recipe;
  const [ingredients, setIngredients] = useState<IngItem[]>(recipe?.ingredients.map((i: { name: string; amount?: string | null; group: "main" | "seasoning" }) => ({ name: i.name, amount: i.amount || "", group: i.group })) || []);
  const [steps] = useState<StepItem[]>(recipe?.steps.map((s: { content: string }) => ({ content: s.content })) || []);
  const [stepText, setStepText] = useState(steps.map((s: { content: string }) => s.content).join("\n"));

  function addIng(group: "main" | "seasoning") { setIngredients([...ingredients, { name: "", amount: "", group }]); }
  function updateIng(i: number, field: keyof IngItem, value: string) { const copy = [...ingredients]; copy[i] = { ...copy[i], [field]: value }; setIngredients(copy); }
  function removeIng(i: number) { setIngredients(ingredients.filter((_, idx) => idx !== i)); }

  async function handleSubmit(formData: FormData) {
    formData.set("ingredients", JSON.stringify(ingredients.filter((i) => i.name.trim())));
    const stepLines = stepText.split("\n").map((s) => s.trim()).filter(Boolean);
    formData.set("steps", JSON.stringify(stepLines.map((content) => ({ content }))));
    if (isEdit) return updateRecipe(recipe!.id, formData);
    return createRecipe(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <PageTitle title={isEdit ? "编辑菜谱" : "新增菜谱"} />
      <section className="card grid gap-4 p-5"><h2 className="font-black text-orange-700">基本信息</h2>
        <label className="label">菜名<input className="field" name="title" defaultValue={recipe?.title} required /></label>
        <label className="label">简介<textarea className="field" name="description" defaultValue={recipe?.description || ""} rows={2} /></label>
        <label className="label">封面图<input className="field" name="coverImage" type="file" accept="image/*" /></label>
        <div className="grid gap-4 sm:grid-cols-3"><label className="label">分类<select className="field" name="categoryId"><option value="">不选</option>{categories.map((c) => <option selected={c.id === recipe?.categoryId} key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="label">难度<select className="field" name="difficulty" defaultValue={recipe?.difficulty || "easy"}><option value="easy">简单</option><option value="medium">中等</option><option value="hard">费工夫</option></select></label>
        <label className="label">份量<input className="field" name="servings" type="number" min={1} defaultValue={recipe?.servings || ""} placeholder="例如 2 人份" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="label">准备时间（分钟）<input className="field" name="prepTimeMinutes" type="number" min={1} defaultValue={recipe?.prepTimeMinutes || ""} /></label>
        <label className="label">烹饪时间（分钟）<input className="field" name="cookTimeMinutes" type="number" min={1} defaultValue={recipe?.cookTimeMinutes || ""} /></label></div>
      </section>
      <section className="card p-5 space-y-3"><h2 className="font-black text-orange-700">食材</h2>
        {ingredients.map((item, i) => <div className="flex gap-2" key={i}><select className="field w-28" value={item.group} onChange={(e) => updateIng(i, "group", e.target.value)}><option value="main">主料</option><option value="seasoning">调料</option></select><input className="field flex-1" placeholder="名称" value={item.name} onChange={(e) => updateIng(i, "name", e.target.value)} /><input className="field w-28" placeholder="用量" value={item.amount} onChange={(e) => updateIng(i, "amount", e.target.value)} /><button type="button" className="btn danger" onClick={() => removeIng(i)}>✕</button></div>)}
        <div className="flex gap-2"><button type="button" className="btn secondary" onClick={() => addIng("main")}>+ 添加主料</button><button type="button" className="btn secondary" onClick={() => addIng("seasoning")}>+ 添加调料</button></div>
      </section>
      <section className="card p-5 space-y-3"><h2 className="font-black text-orange-700">做法步骤</h2>
        <textarea className="field" rows={6} placeholder="每行一个步骤&#10;炒熟鸡蛋，盛出&#10;放入番茄翻炒" value={stepText} onChange={(e) => setStepText(e.target.value)} />
      </section>
      <section className="card grid gap-3 p-5"><h2 className="font-black text-orange-700">小贴士</h2>
        <textarea className="field" name="tips" defaultValue={recipe?.tips || ""} rows={2} placeholder="可选，比如关键火候、替代食材等" />
      </section>
      <button className="btn">{isEdit ? "保存修改" : "创建菜谱"}</button>
    </form>
  );
}
