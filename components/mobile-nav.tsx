import Link from "next/link";

const items = [
  ["/", "首页", "🏠"],
  ["/recipes", "菜谱", "📖"],
  ["/random", "随机", "🎲"],
  ["/menu", "菜单", "📅"],
  ["/shopping", "购物", "🛒"],
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-3 left-1/2 z-50 grid w-[min(94vw,34rem)] -translate-x-1/2 grid-cols-5 rounded-3xl bg-white/95 p-2 shadow-2xl ring-1 ring-orange-100 backdrop-blur">
      {items.map(([href, label, icon]) => (
        <Link key={href} href={href} className="rounded-2xl px-2 py-2 text-center text-xs font-bold text-orange-800 hover:bg-orange-50">
          <div className="text-lg">{icon}</div>
          {label}
        </Link>
      ))}
    </nav>
  );
}
