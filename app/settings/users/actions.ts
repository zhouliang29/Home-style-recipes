"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function createMember(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!name || !username || !password) return;
  db.prepare("INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, 'member')").run(randomUUID(), name, username, await hashPassword(password));
  revalidatePath("/settings/users");
}

export async function resetPassword(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const password = String(formData.get("password") || "");
  if (password.length < 6) return;
  db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(await hashPassword(password), Date.now(), id);
  revalidatePath("/settings/users");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const row = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as { role: string } | undefined;
  if (!row) return;
  if (row.role === "admin") {
    const count = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    if (count.count <= 1) return;
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  revalidatePath("/settings/users");
}
