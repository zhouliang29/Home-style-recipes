import { requireUser } from "@/lib/auth";
import { getOrCreateCurrentMenu, listMenuItems } from "@/lib/menu";
import { listRecipes } from "@/lib/recipes";
import { weekDays, mealLabels, type MealType } from "@/lib/week";
import { PageTitle } from "@/components/ui-blocks";
import { addMenuItemAction, deleteMenuItemAction } from "./actions";
import { generateShoppingFromMenuAction } from "@/app/shopping/actions";

export default async function MenuPage() {
  const user = await requireUser();
  const menu = getOrCreateCurrentMenu();
  const items = listMenuItems(menu.id);
  const recipes = listRecipes({ userId: user.id });
  const days = weekDays();
  const meals = Object.entries(mealLabels) as [MealType, string][];
  return <div className="space-y-5"><PageTitle title="本周菜单" subtitle="按周一到周日安排三餐。" action={<form action={generateShoppingFromMenuAction}><button className="btn">生成购物清单</button></form>} />
    <div className="grid gap-4 lg:grid-cols-7">{days.map((day) => <section className="card p-3" key={day.timestamp}><h2 className="mb-3 text-center font-black text-orange-700">{day.label}<br/><span className="text-xs muted">{new Date(day.timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</span></h2>
      {meals.map(([meal, label]) => <div className="mb-3 rounded-2xl bg-orange-50 p-2" key={meal}><div className="mb-2 font-bold text-orange-800">{label}</div>
        <div className="space-y-1">{items.filter((i) => i.date === day.timestamp && i.mealType === meal).map((item) => <form action={deleteMenuItemAction} className="flex items-center justify-between gap-2 rounded-xl bg-white px-2 py-1 text-sm" key={item.id}><span>{item.recipeTitle || item.customText}</span><input type="hidden" name="id" value={item.id} /><button className="text-red-600" title="删除">×</button></form>)}</div>
        <form action={addMenuItemAction} className="mt-2 grid gap-1"><input type="hidden" name="date" value={day.timestamp} /><input type="hidden" name="mealType" value={meal} /><select className="field text-sm" name="recipeId"><option value="">选择菜谱</option>{recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select><input className="field text-sm" name="customText" placeholder="或输入：外卖/剩菜" /><button className="btn secondary text-sm">添加</button></form>
      </div>)}
    </section>)}</div>
  </div>;
}
