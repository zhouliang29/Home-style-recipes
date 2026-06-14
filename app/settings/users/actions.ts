"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isNextInternalError } from "@/lib/next-errors";

/** 供 form action 使用，返回 void */
export async function createMember(formData: FormData): Promise<void> {
  const result = await createMemberInner(formData);
  if (result.error) throw new Error(result.error);
}

async function createMemberInner(formData: FormData): Promise<{ ok?: true; error?: string }> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "member");
    if (!name || !username || !password) return { error: "请填写所有字段" };
    if (password.length < 6) return { error: "密码至少 6 位" };
    if (role !== "admin" && role !== "member") return { error: "无效角色" };
    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (exists) return { error: `用户名 "${username}" 已存在` };
    db.prepare("INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)").run(randomUUID(), name, username, await hashPassword(password), role);
    revalidatePath("/settings/users");
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "添加失败" };
  }
}

export async function resetPasswordAction(id: string, password: string): Promise<{ ok?: true; error?: string }> {
  try {
    await requireAdmin();
    if (!password || password.length < 6) return { error: "密码至少 6 位" };
    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(await hashPassword(password), Date.now(), id);
    revalidatePath("/settings/users");
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "重置失败" };
  }
}

export async function deleteUserAction(id: string): Promise<{ ok?: true; error?: string }> {
  try {
    await requireAdmin();
    const row = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as { role: string } | undefined;
    if (!row) return { error: "用户不存在" };
    if (row.role === "admin") {
      const count = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
      if (count.count <= 1) return { error: "不能删除最后一个管理员" };
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    revalidatePath("/settings/users");
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "删除失败" };
  }
}

export async function updateRoleAction(id: string, role: string): Promise<{ ok?: true; error?: string }> {
  try {
    await requireAdmin();
    if (role !== "admin" && role !== "member") return { error: "无效角色" };
    if (role === "member") {
      const row = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as { role: string } | undefined;
      if (row?.role === "admin") {
        const count = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
        if (count.count <= 1) return { error: "不能降级最后一个管理员" };
      }
    }
    db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(role, Date.now(), id);
    revalidatePath("/settings/users");
    return { ok: true };
  } catch (e) {
    if (isNextInternalError(e)) throw e;
    return { error: e instanceof Error ? e.message : "修改失败" };
  }
}
