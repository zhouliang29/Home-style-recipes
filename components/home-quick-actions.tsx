import Link from "next/link";

const actions = [
  ["/recipes/new", "新增菜谱", "记录一道家常好菜", "➕"],
  ["/random", "今天吃什么", "让系统帮你选", "🎲"],
  ["/menu", "本周菜单", "安排一周三餐", "📅"],
  ["/shopping", "购物清单", "买菜不漏项", "🛒"],
];

export function HomeQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {actions.map(([href, title, desc, icon], i) => (
        <Link
          className={`card card-hover group flex flex-col items-center p-4 text-center sm:flex-row sm:p-5 sm:text-left ${i >= 2 ? "animate-fade-up animate-fade-up-delay-1" : "animate-fade-up"}`}
          href={href}
          key={href}
        >
          <span className="text-3xl transition-transform group-hover:scale-110 sm:mr-3 sm:text-4xl">{icon}</span>
          <span className="mt-2 sm:mt-0">
            <span className="block text-base font-black text-orange-700 sm:text-lg">{title}</span>
            <span className="mt-0.5 block text-xs muted sm:text-sm">{desc}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
