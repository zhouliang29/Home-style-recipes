import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db/client";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "family_recipes_session";
const maxAge = 60 * 60 * 24 * 30;

function secretKey() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me-before-production");
}

export async function createSession(user: User) {
  const token = await new SignJWT({ id: user.id, username: user.username, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const row = db
      .prepare("SELECT id, name, username, role FROM users WHERE id = ?")
      .get(payload.id) as User | undefined;
    return row ?? null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

export function canEditRecipe(user: User, recipe: { createdById: string }) {
  return user.role === "admin" || user.id === recipe.createdById;
}
