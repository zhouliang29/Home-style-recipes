import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8 mobile-nav-safe">
      <header className="sticky top-2 z-40 mb-4 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-2.5 shadow-[0_2px_16px_-6px_rgba(146,64,14,0.18)] ring-1 ring-orange-100/80 backdrop-blur-xl sm:rounded-3xl sm:px-5 sm:py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-orange-600 transition hover:text-orange-700 sm:text-2xl">
          <span className="text-2xl sm:text-3xl">🍲</span>
          <span>家味菜谱</span>
        </Link>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {user ? (
            <UserMenu username={user.username} role={user.role} />
          ) : (
            <Link className="btn py-2" href="/login">登录</Link>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <MobileNav />
    </div>
  );
}
