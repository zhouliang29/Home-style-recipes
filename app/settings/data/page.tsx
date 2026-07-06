import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/ui-blocks";
import { ImportExportButtons } from "@/components/import-export-button";
import { listRecipes } from "@/lib/recipes";

export default async function DataPage() {
  const user = await requireUser();
  const recipes = listRecipes({ userId: user.id });

  return (
    <div className="space-y-5">
      <PageTitle
        title="数据管理"
        subtitle="导出菜谱备份，或导入菜谱文件"
      />

      <div className="card p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-800">菜谱统计</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-orange-50 p-4 text-center">
            <div className="text-3xl font-black text-orange-600">{recipes.length}</div>
            <div className="text-sm text-gray-600">个菜谱</div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-800">导入导出</h2>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-bold text-gray-800">📤 导出菜谱</h3>
            <p className="mt-1 text-sm text-gray-600">
              将所有菜谱导出为 JSON 格式文件，可用于备份或分享
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-bold text-gray-800">📥 导入菜谱</h3>
            <p className="mt-1 text-sm text-gray-600">
              从 JSON 文件导入菜谱，同名菜谱会自动跳过
            </p>
          </div>
          <ImportExportButtons />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-800">说明</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 导出文件包含菜谱标题、描述、食材、步骤等完整信息</li>
          <li>• 导入时会自动创建不存在的分类</li>
          <li>• 同名菜谱会自动跳过，避免重复</li>
          <li>• 图片不会导出（图片保存在本地）</li>
        </ul>
      </div>
    </div>
  );
}
