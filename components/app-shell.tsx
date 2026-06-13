import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="mb-5 flex items-center justify-between rounded-3xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-orange-100">
        <Link href="/" className="text-2xl font-black text-orange-600">🍲 家味菜谱</Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden sm:inline muted">{user.name} · {user.role === "admin" ? "管理员" : "成员"}</span>
              {user.role === "admin" && <Link className="font-bold text-orange-700" href="/settings/users">成员</Link>}
              <Link className="font-bold text-orange-700" href="/logout">退出</Link>
            </>
          ) : <Link className="btn" href="/login">登录</Link>}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <MobileNav />
    </div>
  );
}
