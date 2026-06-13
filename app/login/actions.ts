"use server";

import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import type { User } from "@/lib/types";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const row = db.prepare("SELECT id, name, username, password_hash as passwordHash, role FROM users WHERE username = ?").get(username) as (User & { passwordHash: string }) | undefined;
  if (!row || !(await verifyPassword(password, row.passwordHash))) return { error: "账号或密码不正确" };
  await createSession({ id: row.id, name: row.name, username: row.username, role: row.role });
  redirect("/");
}
