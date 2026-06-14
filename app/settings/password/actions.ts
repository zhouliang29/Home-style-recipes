"use server";
import { db } from "@/db/client";
import { requireUser } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/password";
import { isNextInternalError } from "@/lib/next-errors";

export async function changePasswordAction(formData: FormData): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requireUser();
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "请填写所有字段" };
    }
    if (newPassword.length < 6) {
      return { error: "新密码至少 6 位" };
    }
    if (newPassword !== confirmPassword) {
      return { error: "两次输入的新密码不一致" };
    }

    const row = db.prepare("SELECT password_hash as passwordHash FROM users WHERE id = ?").get(user.id) as { passwordHash: string } | undefined;
    if (!row) return { error: "用户不存在" };

    const valid = await verifyPassword(currentPassword, row.passwordHash);
    if (!valid) return { error: "当前密码不正确" };

    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(await hashPassword(newPassword), Date.now(), user.id);
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "修改失败" };
  }
}
