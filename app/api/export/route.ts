import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { exportRecipes } from "@/lib/import-export";

export async function GET() {
  const user = await requireUser();
  const data = exportRecipes(user.id);

  // 生成文件名
  const date = new Date().toISOString().slice(0, 10);
  const filename = `home-recipes-${date}.json`;

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
