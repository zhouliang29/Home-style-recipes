import { requireUser } from "@/lib/auth";
import { getOrCreateCurrentMenu, listMenuItems } from "@/lib/menu";
import { listRecipes } from "@/lib/recipes";
import { weekDays, mealLabels, type MealType } from "@/lib/week";
import { addMenuItemAction, deleteMenuItemAction } from "./actions";
import { generateShoppingFromMenuAction } from "@/app/shopping/actions";

const mealEmoji: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };

export default async function MenuPage() {
  const user = await requireUser();
  const menu = getOrCreateCurrentMenu();
  const items = listMenuItems(menu.id);
  const recipes = listRecipes({ userId: user.id });
  const days = weekDays();
  const meals = Object.entries(mealLabels) as [MealType, string][];
  const today = new Date().setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-orange-700 sm:text-3xl">本周菜单</h1>
          <p className="mt-0.5 text-sm muted">按周一到周日安排三餐，安排完一键生成购物清单</p>
        </div>
        <form action={generateShoppingFromMenuAction}>
          <button className="btn">🛒 生成购物清单</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day, di) => {
          const isToday = day.timestamp === today;
          return (
            <section
              className={`card animate-fade-up p-4 ${isToday ? "ring-2 ring-orange-400" : ""}`}
              key={day.timestamp}
              style={{ animationDelay: `${Math.min(di, 7) * 0.05}s` }}
            >
              <h2 className="mb-3 text-center">
                <span className="text-lg font-black text-orange-700">
                  {isToday && <span className="mr-1">📍</span>}{day.label}
                </span>
                <br />
                <span className="text-xs muted">
                  {new Date(day.timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                  {isToday && " · 今天"}
                </span>
              </h2>

              {meals.map(([meal, label]) => {
                const dayItems = items.filter((i) => i.date === day.timestamp && i.mealType === meal);
                return (
                  <div className="mb-3 rounded-2xl bg-orange-50/70 p-2.5 last:mb-0" key={meal}>
                    <div className="mb-1.5 text-sm font-bold text-orange-800">{mealEmoji[meal]} {label}</div>
                    <div className="space-y-1">
                      {dayItems.map((item) => (
                        <form action={deleteMenuItemAction} className="flex items-center justify-between gap-2 rounded-xl bg-white px-2.5 py-1.5 text-sm shadow-sm" key={item.id}>
                          <span className="min-w-0 truncate">{item.recipeTitle || item.customText}</span>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="mobile-action flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50" title="删除" aria-label="删除">×</button>
                        </form>
                      ))}
                    </div>
                    <form action={addMenuItemAction} className="mt-2 grid gap-1.5">
                      <input type="hidden" name="date" value={day.timestamp} />
                      <input type="hidden" name="mealType" value={meal} />
                      <select className="field !py-1.5 text-sm" name="recipeId">
                        <option value="">选择菜谱</option>
                        {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>
                      <input className="field !py-1.5 text-sm" name="customText" placeholder="或输入：外卖 / 剩菜" />
                      <button className="btn secondary !py-1.5 text-sm">添加</button>
                    </form>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
