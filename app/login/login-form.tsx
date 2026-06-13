"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card mx-auto grid max-w-md gap-4 p-6">
      <div><h1 className="text-3xl font-black text-orange-700">登录家味菜谱</h1><p className="muted">默认账号 admin，密码见 seed 输出或环境变量。</p></div>
      {state?.error && <div className="rounded-2xl bg-red-50 p-3 font-bold text-red-700">{state.error}</div>}
      <label className="label">用户名<input className="field" name="username" defaultValue="admin" required /></label>
      <label className="label">密码<input className="field" name="password" type="password" required /></label>
      <button className="btn" disabled={pending}>{pending ? "登录中..." : "登录"}</button>
    </form>
  );
}
