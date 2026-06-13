"use client";
import { useState } from "react";
import { weekDays, mealLabels, type MealType } from "@/lib/week";
import { addMenuItemAction } from "@/app/menu/actions";

export function AddToMenuDialog({ recipeId, recipeTitle }: { recipeId: string; recipeTitle: string }) {
  const [open, setOpen] = useState(false);
  const days = weekDays();
  async function add(formData: FormData) {
    await addMenuItemAction(formData);
    setOpen(false);
  }
  return <>{open ? <form className="card flex flex-wrap gap-2 p-3" action={add}>
    <input type="hidden" name="recipeId" value={recipeId} />
    <span className="font-bold text-orange-700">把「{recipeTitle}」加入</span>
    <select className="field w-32" name="date">{days.map((d) => <option key={d.timestamp} value={d.timestamp}>{d.label}</option>)}</select>
    <select className="field w-28" name="mealType">{(Object.entries(mealLabels) as [MealType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
    <button className="btn">添加</button><button className="btn secondary" type="button" onClick={()=>setOpen(false)}>取消</button>
  </form> : <button className="btn secondary" type="button" onClick={()=>setOpen(true)}>📅 加入菜单</button>}</>;
}
