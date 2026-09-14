import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[72vh] items-center justify-center py-6">
      <div className="w-full max-w-sm animate-fade-up">
        {/* 品牌头部 */}
        <div className="mb-7 text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-5xl shadow-[0_10px_30px_-8px_rgba(234,88,12,0.5)]">
            <span>🍲</span>
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow ring-1 ring-orange-100">🥕</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-orange-700">家味菜谱</h1>
          <p className="mt-1.5 muted">记录家的味道 · 今天也好好吃饭</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
