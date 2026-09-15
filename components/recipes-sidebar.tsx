"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Filter = { id: string; label: string; icon?: string; isChef: boolean };

export function RecipesSidebar({ filters, q, activeCategory, activeChef, allActive }: {
  filters: Filter[];
  q?: string;
  activeCategory: string | null;
  activeChef: string | null;
  allActive: boolean;
}) {
  // 滚动联动：当前视口所在的分组分类 id（仅"全部"视图下生效）
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const spyActive = allActive; // 分组视图 = 全部且无搜索词

  useEffect(() => {
    if (!spyActive) { setCurrentSection(null); return; }
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section-category]"));
    if (!sections.length) return;
    const onScroll = () => {
      // 以视口上部 1/3 为判定线，取最后一个越线分组
      const line = window.innerHeight / 3;
      let cur: string | null = null;
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= line) cur = s.dataset.sectionCategory || null;
      }
      setCurrentSection(cur ?? sections[0]?.dataset.sectionCategory ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [spyActive]);

  // 客户端自行拼 URL（服务端函数不能传进来）
  const hrefFor = (id: string | null, isChef: boolean) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (id !== null) {
      if (isChef) p.set("chef", id);
      else p.set("categoryId", id);
    }
    const s = p.toString();
    return `/recipes${s ? `?${s}` : ""}`;
  };

  const isActive = (f: Filter) => {
    if (spyActive) {
      // 分组视图：无选中项，按滚动位置高亮（厨师项不高亮）
      return !f.isChef && f.id === currentSection;
    }
    return f.isChef ? activeChef === f.id : activeCategory === f.id;
  };

  const item = (f: Filter) => {
    const active = isActive(f);
    // 分组视图下点分类 = 同页滚动到对应分组；其他视图 = 跳转筛选
    const handleClick = (e: React.MouseEvent) => {
      if (spyActive && !f.isChef) {
        e.preventDefault();
        document.querySelector(`[data-section-category="${f.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    return (
      <Link
        key={f.id}
        href={spyActive && !f.isChef ? "#" : hrefFor(f.id, f.isChef)}
        onClick={handleClick}
        className={`mobile-action flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-center text-xs font-bold leading-tight transition active:scale-95 ${
          active
            ? f.isChef
              ? "bg-amber-600 text-white shadow-md ring-1 ring-amber-600"
              : "bg-orange-500 text-white shadow-md ring-1 ring-orange-500"
            : "bg-white text-orange-800 ring-1 ring-orange-100"
        }`}
      >
        {f.isChef ? <span>👨‍🍳</span> : f.icon ? <span>{f.icon}</span> : null}
        <span className="w-full truncate px-0.5">{f.label}</span>
      </Link>
    );
  };

  return (
    <aside className="sticky top-20 flex max-h-[calc(100vh-11rem)] w-[4.6rem] shrink-0 flex-col gap-1.5 self-start overflow-y-auto pb-1 sm:hidden [&::-webkit-scrollbar]:hidden">
      <Link
        href={hrefFor(null, false)}
        className={`mobile-action flex items-center justify-center rounded-xl px-1 py-2 text-xs font-bold transition active:scale-95 ${
          spyActive || (!activeCategory && !activeChef) ? "bg-orange-500 text-white shadow-md ring-1 ring-orange-500" : "bg-white text-orange-800 ring-1 ring-orange-100"
        }`}
      >
        全部
      </Link>
      {filters.map(item)}
    </aside>
  );
}
