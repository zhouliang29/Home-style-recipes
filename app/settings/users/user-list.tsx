"use client";
import { useState } from "react";
import { createMember, resetPasswordAction, deleteUserAction, updateRoleAction } from "./actions";

type User = { id: string; name: string; username: string; role: string };

/** Toast 提示 */
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  return (
    <div className={`fixed left-1/2 top-6 z-[9999] -translate-x-1/2 rounded-2xl px-6 py-3 font-bold shadow-xl transition-all ${type === "ok" ? "bg-green-100 text-green-800 ring-2 ring-green-300" : "bg-red-100 text-red-800 ring-2 ring-red-300"}`}>
      <span className="mr-2">{type === "ok" ? "✅" : "❌"}</span>
      {msg}
      <button type="button" className="ml-3 opacity-60 hover:opacity-100" onClick={onClose}>✕</button>
    </div>
  );
}

export function UserList({ users }: { users: User[] }) {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirm, setConfirm] = useState<{ action: "delete" | "reset" | "role"; target: string; extra?: string } | null>(null);
  const [pwInput, setPwInput] = useState("");
  const [pending, setPending] = useState(false);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleConfirm() {
    if (!confirm) return;
    setPending(true);
    try {
      let res: { ok?: true; error?: string };
      if (confirm.action === "delete") {
        res = await deleteUserAction(confirm.target);
      } else if (confirm.action === "reset") {
        if (!pwInput || pwInput.length < 6) { showToast("密码至少 6 位", "err"); setPending(false); return; }
        res = await resetPasswordAction(confirm.target, pwInput);
      } else if (confirm.action === "role" && confirm.extra) {
        res = await updateRoleAction(confirm.target, confirm.extra);
      } else return;
      if (res.ok) {
        showToast(confirm.action === "delete" ? "删除成功" : confirm.action === "reset" ? "密码重置成功" : "角色修改成功");
        window.location.reload();
      } else {
        showToast(res.error || "操作失败", "err");
      }
    } catch {
      showToast("操作失败", "err");
    }
    setConfirm(null);
    setPwInput("");
    setPending(false);
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* 确认弹窗 */}
      {confirm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirm(null)}>
          <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-orange-100" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-orange-800">
              {confirm.action === "delete" ? "🗑️ 确认删除" : confirm.action === "reset" ? "🔑 重置密码" : "👤 修改角色"}
            </h3>
            <p className="mt-2 muted">
              {confirm.action === "delete"
                ? `确定删除用户「${users.find(u => u.id === confirm.target)?.name}」吗？此操作不可撤销。`
                : confirm.action === "reset"
                ? `为「${users.find(u => u.id === confirm.target)?.name}」设置新密码：`
                : `确定修改角色吗？`}
            </p>
            {confirm.action === "reset" && (
              <input
                className="field mt-3"
                type="password"
                placeholder="输入新密码（至少 6 位）"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                minLength={6}
              />
            )}
            <div className="mt-4 flex gap-2">
              <button className="btn flex-1" onClick={handleConfirm} disabled={pending}>
                {pending ? "处理中..." : "确认"}
              </button>
              <button className="btn secondary flex-1" onClick={() => { setConfirm(null); setPwInput(""); }} disabled={pending}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户列表 */}
      <div className="grid gap-3">
        {users.map((u) => (
          <div className="card grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center" key={u.id}>
            <div>
              <div className="font-black text-orange-800">{u.name} <span className="text-sm muted">@{u.username}</span></div>
              <div className="text-sm muted">{u.role === "admin" ? "管理员" : "成员"}</div>
            </div>
            <select
              className="field text-sm w-28"
              defaultValue={u.role}
              onChange={(e) => setConfirm({ action: "role", target: u.id, extra: e.target.value })}
            >
              <option value="member">成员</option>
              <option value="admin">管理员</option>
            </select>
            <button className="btn secondary text-sm" onClick={() => setConfirm({ action: "reset", target: u.id })}>
              🔑 重置密码
            </button>
            <button className="btn danger text-sm" onClick={() => setConfirm({ action: "delete", target: u.id })}>
              🗑️ 删除
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
