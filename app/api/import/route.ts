import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { importRecipes, validateImportData } from "@/lib/import-export";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    const data = await request.json();

    // 验证数据格式
    const validation = validateImportData(data);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // 执行导入
    const result = importRecipes(user.id, data);

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, errors: ["文件解析失败，请确保是有效的 JSON 格式"] },
      { status: 400 }
    );
  }
}
