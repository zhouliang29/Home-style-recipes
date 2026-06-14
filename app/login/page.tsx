import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-8">
      <div className="w-full max-w-md">
        {/* 装饰头部 */}
        <div className="mb-6 text-center">
          <div className="text-6xl">🍲</div>
          <h1 className="mt-3 text-3xl font-black text-orange-700">家味菜谱</h1>
          <p className="mt-1 muted">记录家的味道</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
