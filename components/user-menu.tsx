"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const roleLabel: Record<string, string> = {
  admin: "系统管理员",
  member: "成员",
};

export function UserMenu({ username, role }: { username?: string; role?: string }) {
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  function updatePos() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }

  useEffect(() => {
    if (open) {
      updatePos();
      window.addEventListener("resize", updatePos);
      window.addEventListener("scroll", updatePos, true);
      return () => {
        window.removeEventListener("resize", updatePos);
        window.removeEventListener("scroll", updatePos, true);
      };
    }
  }, [open]);

  // 点击外部关闭（排除 portal 内的点击）
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
      setConfirmLogout(false);
    }
    // 用 mouseup 而非 mousedown，避免先关闭导致 Link 导航中断
    document.addEventListener("mouseup", handleClick);
    return () => document.removeEventListener("mouseup", handleClick);
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setConfirmLogout(false); }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 font-bold text-orange-800 ring-1 ring-orange-200 transition hover:bg-orange-100"
        onClick={() => { setOpen((v) => !v); setConfirmLogout(false); }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
          {(username || "?").charAt(0)}
        </span>
        <span className="max-w-[8rem] truncate">{username || "用户"}</span>
        <span className="text-xs text-orange-500">· {roleLabel[role || "member"] || role}</span>
        <svg className={`h-4 w-4 text-orange-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={portalRef}
          className="fixed z-[9999] w-48 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-orange-100"
          style={{ top: pos.top, right: pos.right }}
        >
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

          {/* 退出登录 */}
          {!confirmLogout ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-orange-100 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              onClick={() => setConfirmLogout(true)}
            >
              🚪 退出登录
            </button>
          ) : (
            <div className="border-t border-orange-100 bg-red-50 px-4 py-3 space-y-2">
              <p className="text-xs font-bold text-red-700">确定退出登录吗？</p>
              <div className="flex gap-2">
                <Link
                  href="/logout"
                  className="btn danger flex-1 py-1.5 text-xs"
                  onClick={() => setOpen(false)}
                >
                  确认退出
                </Link>
                <button
                  type="button"
                  className="btn secondary flex-1 py-1.5 text-xs"
                  onClick={() => setConfirmLogout(false)}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
