"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/", "首页", "🏠"],
  ["/recipes", "菜谱", "📖"],
  ["/meal-order", "点菜", "📋"],
  ["/menu", "菜单", "📅"],
  ["/shopping", "购物", "🛒"],
];

export function MobileNav() {
  const pathname = usePathname() || "/";
  return (
    <nav className="tabbar" aria-label="主导航">
      {items.map(([href, label, icon]) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            <span className="tab-icon" aria-hidden>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
