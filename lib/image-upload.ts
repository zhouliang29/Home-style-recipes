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
  // 某些移动浏览器 MIME type 可能为空，通过扩展名后备判断
  let mimeType = file.type;
  if (!mimeType && file.name) {
    const nameExt = file.name.split(".").pop()?.toLowerCase();
    const extMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    if (nameExt && extMap[nameExt]) mimeType = extMap[nameExt];
  }
  if (!allowed.has(mimeType)) throw new Error("只支持 jpg、png、webp 图片");
  if (file.size > 5 * 1024 * 1024) throw new Error("图片不能超过 5MB");
  const now = new Date();
  const relDir = `recipes/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(process.cwd(), "uploads", relDir);
  await fs.mkdir(dir, { recursive: true });
  const ext = allowed.get(mimeType);
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${relDir}/${filename}`;
}
