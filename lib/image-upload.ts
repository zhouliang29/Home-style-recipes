import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_SIZE = 5 * 1024 * 1024;

// 某些移动浏览器 MIME type 可能为空，通过扩展名后备判断
function resolveMimeType(mimeType: string, fileName?: string): string {
  if (mimeType) return mimeType;
  if (!fileName) return "";
  const nameExt = fileName.split(".").pop()?.toLowerCase();
  const extMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  return (nameExt && extMap[nameExt]) || "";
}

function sizeError(size: number): never {
  const sizeStr = size > 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)}MB`
    : `${(size / 1024).toFixed(1)}KB`;
  throw new Error(`图片 ${sizeStr}，超过 5MB 限制，请压缩后重试`);
}

// 校验 MIME 与大小，返回规范化后的扩展名
function checkImage(mimeType: string, size: number): string {
  if (!allowed.has(mimeType)) {
    const sizeStr = size > 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(1)}MB`
      : `${(size / 1024).toFixed(1)}KB`;
    throw new Error(`不支持该图片格式（${mimeType || "未知"}），只支持 JPG、PNG、WebP。文件大小：${sizeStr}`);
  }
  if (size > MAX_SIZE) sizeError(size);
  return allowed.get(mimeType)!;
}

function newRelPath(ext: string): string {
  const now = new Date();
  return `recipes/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
}

export async function saveRecipeImage(file: File | null) {
  if (!file || file.size === 0) return null;

  const mimeType = resolveMimeType(file.type, file.name);
  const ext = checkImage(mimeType, file.size);
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = saveRecipeImageBuffer(buffer, `${mimeType}`);
  return url;
}

// 同步保存图片 Buffer（导入流程在 SQLite 事务中，需要同步写盘），返回可访问的 URL
export function saveRecipeImageBuffer(buffer: Buffer, mimeType: string): string {
  const ext = checkImage(mimeType, buffer.length);
  const relPath = newRelPath(ext);
  const dir = path.join(process.cwd(), "uploads", path.dirname(relPath));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, path.basename(relPath)), buffer);
  return `/uploads/${relPath}`;
}

export const MAX_IMAGE_SIZE = MAX_SIZE;

export const allowedImageMimes = [...allowed.keys()];

// 根据图片 URL 后缀推断 MIME type，非本地 uploads 图片返回 null
export function imageMimeFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("/uploads/")) return null;
  const ext = path.extname(url).toLowerCase().slice(1);
  const map: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  return map[ext] || null;
}

// 把 /uploads/... URL 解析为磁盘上的绝对路径（防目录穿越），非本地图片返回 null
export function uploadsFilePathFromUrl(url: string): string | null {
  if (!url || !url.startsWith("/uploads/")) return null;
  const rel = path.normalize(url.slice("/uploads/".length)).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(process.cwd(), "uploads", rel);
}
