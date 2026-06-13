import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/recipes";
import { HomeQuickActions } from "@/components/home-quick-actions";
import { RecentRecipes } from "@/components/recent-recipes";

export default async function Home() {
  await requireUser();
  const categories = getCategories();
  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
        <p className="font-bold opacity-90">今天也好好吃饭</p>
        <h1 className="mt-2 text-4xl font-black">家里的味道，都在这里</h1>
        <form action="/recipes" className="mt-5 flex gap-2">
          <input className="field text-orange-950" name="q" placeholder="搜菜名或食材，如 番茄、鸡蛋" />
          <button className="btn secondary" type="submit">搜索</button>
        </form>
      </section>
      <HomeQuickActions />
      <section>
        <h2 className="mb-3 text-2xl font-black text-orange-700">分类入口</h2>
        <div className="flex flex-wrap gap-2">{categories.map((c) => <Link className="rounded-full bg-white px-4 py-2 font-bold text-orange-700 ring-1 ring-orange-200" href={`/recipes?categoryId=${c.id}`} key={c.id}>{c.name}</Link>)}</div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-2xl font-black text-orange-700">最近添加</h2><Link className="font-bold text-orange-700" href="/recipes">全部菜谱 →</Link></div>
        <RecentRecipes />
      </section>
    </div>
  );
}
