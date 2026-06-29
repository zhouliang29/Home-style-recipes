import Link from "next/link";

const items = [
  ["/", "首页", "🏠"],
  ["/recipes", "菜谱", "📖"],
  ["/random", "随机", "🎲"],
  ["/meal-order", "点菜", "📋"],
  ["/menu", "菜单", "📅"],
  ["/shopping", "购物", "🛒"],
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-3 left-1/2 z-50 grid w-[min(94vw,40rem)] -translate-x-1/2 grid-cols-6 rounded-3xl bg-white/95 p-2 shadow-2xl ring-1 ring-orange-100 backdrop-blur-xl">
      {items.map(([href, label, icon]) => (
        <Link
          key={href}
          href={href}
          className="mobile-action rounded-2xl px-2 py-2 text-center text-xs font-bold text-orange-800 transition hover:bg-orange-50 active:scale-95"
        >
          <div className="text-xl">{icon}</div>
          <div className="mt-0.5">{label}</div>
        </Link>
      ))}
    </nav>
  );
}
