"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card grid gap-5 p-7 sm:p-8">
      {state?.error && (
        <div className="animate-fade-up rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          ⚠️ {state.error}
        </div>
      )}
      <label className="label">
        用户名
        <input className="field" name="username" defaultValue="admin" required placeholder="输入用户名" autoComplete="username" />
      </label>
      <label className="label">
        密码
        <input className="field" name="password" type="password" required placeholder="输入密码" autoComplete="current-password" />
      </label>
      <button className="btn btn-lg w-full" disabled={pending}>
        {pending ? "登录中…" : "登 录"}
      </button>
      <p className="text-center text-sm muted">家庭自用 · 无需注册，账号由管理员分配</p>
    </form>
  );
}
