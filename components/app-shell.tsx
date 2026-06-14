import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-4 sm:px-6 lg:px-8 mobile-nav-safe">
      <header className="mb-6 flex items-center justify-between rounded-3xl bg-white/90 px-5 py-3.5 shadow-sm ring-1 ring-orange-100 backdrop-blur-lg">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black text-orange-600 transition hover:text-orange-700">
          <span className="text-3xl">🍲</span>
          <span>家味菜谱</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <UserMenu username={user.username} role={user.role} />
          ) : (
            <Link className="btn" href="/login">登录</Link>
          )}
        </div>
      </header>
      {/* pb-28 确保内容不被底部导航栏遮挡 */}
      <main className="flex-1 pb-28">{children}</main>
      <MobileNav />
    </div>
  );
}
