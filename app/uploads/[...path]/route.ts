import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const types: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await context.params;
  const safe = path.normalize(parts.join("/")).replace(/^(\.\.(\/|\\|$))+/, "");
  const file = path.join(process.cwd(), "uploads", safe);
  try {
    const data = await fs.readFile(file);
    return new NextResponse(data, { headers: { "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "public, max-age=31536000" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
