"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { changePasswordAction } from "./actions";

export function ChangePasswordForm() {
  type PwState = { ok?: boolean; error?: string } | null;
  const [state, formAction, isPending] = useActionState(
    async (_prev: PwState, formData: FormData): Promise<PwState> => {
      try {
        return (await changePasswordAction(formData)) as PwState;
      } catch (e: unknown) {
        if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) throw e;
        return { error: e instanceof Error ? e.message : "修改失败" };
      }
    },
    null as PwState
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setSuccess(true);
      formRef.current?.reset();
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card grid gap-4 p-5">
      {state?.error && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-3 text-center font-bold text-red-700">
          ⚠️ {state.error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-3 text-center font-bold text-green-700">
          ✅ 密码修改成功
        </div>
      )}
      <label className="label">
        当前密码
        <input className="field" name="currentPassword" type="password" required minLength={6} placeholder="输入当前密码" />
      </label>
      <label className="label">
        新密码
        <input className="field" name="newPassword" type="password" required minLength={6} placeholder="至少 6 位" />
      </label>
      <label className="label">
        确认新密码
        <input className="field" name="confirmPassword" type="password" required minLength={6} placeholder="再次输入新密码" />
      </label>
      <button className="btn w-full" type="submit" disabled={isPending}>
        {isPending ? "修改中..." : "修改密码"}
      </button>
    </form>
  );
}
