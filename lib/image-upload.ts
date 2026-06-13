import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function saveRecipeImage(file: File | null) {
  if (!file || file.size === 0) return null;
  if (!allowed.has(file.type)) throw new Error("只支持 jpg、png、webp 图片");
  if (file.size > 5 * 1024 * 1024) throw new Error("图片不能超过 5MB");
  const now = new Date();
  const relDir = `recipes/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(process.cwd(), "uploads", relDir);
  await fs.mkdir(dir, { recursive: true });
  const ext = allowed.get(file.type);
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${relDir}/${filename}`;
}
