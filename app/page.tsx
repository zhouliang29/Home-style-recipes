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
    <div className="space-y-7">
      {/* Hero 横幅 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-6 text-white shadow-[0_16px_40px_-14px_rgba(234,88,12,0.55)] animate-fade-up sm:p-8">
        <div className="hero-shimmer absolute inset-0" />
        <div className="relative z-10">
          <p className="text-base font-bold text-orange-100 sm:text-lg">今天也好好吃饭 🍚</p>
          <h1 className="mt-2 text-3xl font-black leading-snug sm:text-4xl">家里的味道，都在这里</h1>
          <form action="/recipes" className="mt-5 flex gap-2">
            <input
              className="field flex-1 border-transparent bg-white/95 text-orange-950 placeholder:text-orange-300 focus:border-white focus:bg-white"
              name="q" placeholder="搜菜名或食材，如 番茄、鸡蛋" enterKeyHint="search"
            />
            <button className="btn shrink-0 bg-white/95 bg-none text-orange-600 shadow-[0_2px_10px_-2px_rgba(154,52,18,0.3)]" type="submit">
              搜索
            </button>
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

      {/* 分类入口 */}
      <section className="animate-fade-up animate-fade-up-delay-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">📂 分类</h2>
          <Link className="text-sm font-bold text-orange-600 transition hover:text-orange-800" href="/recipes">全部菜谱 →</Link>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <Link
              className="chip shrink-0"
              href={`/recipes?categoryId=${c.id}`}
              key={c.id}
            >
              {c.icon && <span>{c.icon}</span>}{c.name}
            </Link>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {CHEF_OPTIONS.map((c) => (
            <Link className="chip chip-amber shrink-0" href={`/recipes?chef=${encodeURIComponent(c)}`} key={c}>
              👨‍🍳 {c}
            </Link>
          ))}
        </div>
      </section>

      {/* 最近添加 */}
      <section className="animate-fade-up animate-fade-up-delay-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">🕐 最近添加</h2>
        </div>
        <RecentRecipes />
      </section>
    </div>
  );
}
