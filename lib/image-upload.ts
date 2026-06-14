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
  if (!allowed.has(mimeType)) {
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      : `${(file.size / 1024).toFixed(1)}KB`;
    throw new Error(`不支持该图片格式（${mimeType || "未知"}），只支持 JPG、PNG、WebP。文件大小：${sizeStr}`);
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`图片 ${(file.size / (1024 * 1024)).toFixed(1)}MB，超过 5MB 限制，请压缩后重试`);
  }
  const now = new Date();
  const relDir = `recipes/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(process.cwd(), "uploads", relDir);
  await fs.mkdir(dir, { recursive: true });
  const ext = allowed.get(mimeType);
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${relDir}/${filename}`;
}
