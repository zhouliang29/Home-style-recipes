import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/recipes";
import { HomeQuickActions } from "@/components/home-quick-actions";
import { RecentRecipes } from "@/components/recent-recipes";
import { CHEF_OPTIONS } from "@/lib/constants";

export default async function Home() {
  await requireUser();
  const categories = getCategories();
  return (
    <div className="space-y-8">
      {/* Hero 横幅 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-8 text-white shadow-lg animate-fade-up">
        <div className="hero-shimmer absolute inset-0" />
        <div className="relative z-10">
          <p className="font-bold text-orange-100 text-lg">今天也好好吃饭 🍚</p>
          <h1 className="mt-3 text-4xl font-black text-orange-100 sm:text-5xl">家里的味道，都在这里</h1>
          <form action="/recipes" className="mt-6 flex gap-2">
            <input className="field flex-1 border-orange-300/50 bg-white/95 text-orange-950 placeholder:text-orange-300 focus:border-orange-400 focus:bg-white" name="q" placeholder="搜菜名或食材，如 番茄、鸡蛋" />
            <button className="btn secondary shrink-0" type="submit">🔍 搜索</button>
          </form>
        </div>
        {/* 装饰圆圈 */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/10" />
      </section>

      {/* 快捷操作 */}
      <div className="animate-fade-up animate-fade-up-delay-1">
        <HomeQuickActions />
      </div>

      {/* 分类入口 + 厨师入口 */}
      <section className="animate-fade-up animate-fade-up-delay-2">
        <h2 className="mb-4 text-2xl font-black text-orange-700">📂 分类入口</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              className="rounded-full bg-white px-5 py-2.5 font-bold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-50 hover:shadow-sm"
              href={`/recipes?categoryId=${c.id}`}
              key={c.id}
            >
              {c.icon && <span className="mr-1">{c.icon}</span>}{c.name}
            </Link>
          ))}
          {CHEF_OPTIONS.map((c) => (
            <Link
              className="rounded-full bg-amber-50 px-5 py-2.5 font-bold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100 hover:shadow-sm"
              href={`/recipes?chef=${encodeURIComponent(c)}`}
              key={c}
            >
              👨‍🍳 {c}
            </Link>
          ))}
        </div>
      </section>

      {/* 最近添加 */}
      <section className="animate-fade-up animate-fade-up-delay-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-orange-700">🕐 最近添加</h2>
          <Link className="font-bold text-orange-600 transition hover:text-orange-800" href="/recipes">全部菜谱 →</Link>
        </div>
        <RecentRecipes />
      </section>
    </div>
  );
}
