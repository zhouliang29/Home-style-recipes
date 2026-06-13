import Link from "next/link";

const actions = [
  ["/recipes/new", "新增菜谱", "记录一道家常好菜", "➕"],
  ["/random", "今天吃什么", "让系统帮你选", "🎲"],
  ["/menu", "本周菜单", "安排一周三餐", "📅"],
  ["/shopping", "购物清单", "买菜不漏项", "🛒"],
];

export function HomeQuickActions() {
  return <div className="grid gap-3 sm:grid-cols-2">{actions.map(([href, title, desc, icon]) => <Link className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg" href={href} key={href}><div className="text-3xl">{icon}</div><div className="mt-2 text-xl font-black text-orange-700">{title}</div><p className="muted">{desc}</p></Link>)}</div>;
}
