"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const roleLabel: Record<string, string> = {
  admin: "系统管理员",
  member: "成员",
};

export function UserMenu({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 font-bold text-orange-800 ring-1 ring-orange-200 transition hover:bg-orange-100"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
          {name.charAt(0)}
        </span>
        <span className="max-w-[8rem] truncate">{name}</span>
        <span className="text-xs text-orange-500">· {roleLabel[role] || role}</span>
        <svg className={`h-4 w-4 text-orange-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-orange-100">
          {role === "admin" && (
            <Link
              href="/settings/users"
              className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-orange-800 transition hover:bg-orange-50"
              onClick={() => setOpen(false)}
            >
              👥 用户管理
            </Link>
          )}
          <Link
            href="/settings/password"
            className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-orange-800 transition hover:bg-orange-50"
            onClick={() => setOpen(false)}
          >
            🔑 修改密码
          </Link>
          <Link
            href="/logout"
            className="flex items-center gap-2 border-t border-orange-100 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            onClick={() => setOpen(false)}
          >
            🚪 退出登录
          </Link>
        </div>
      )}
    </div>
  );
}
