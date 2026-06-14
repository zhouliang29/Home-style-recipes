"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card grid gap-5 p-8">
      {state?.error && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-3 font-bold text-red-700">
          ⚠️ {state.error}
        </div>
      )}
      <label className="label">
        用户名
        <input className="field" name="username" defaultValue="admin" required placeholder="输入用户名" />
      </label>
      <label className="label">
        密码
        <input className="field" name="password" type="password" required placeholder="输入密码" />
      </label>
      <button className="btn w-full py-3 text-lg" disabled={pending}>
        {pending ? "登录中..." : "🔑 登录"}
      </button>
      <p className="text-center text-sm muted">默认账号 admin，密码见 seed 输出或环境变量</p>
    </form>
  );
}
