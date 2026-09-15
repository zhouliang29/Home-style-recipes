import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getMealOrder } from "@/lib/meal-order";
import { PageTitle } from "@/components/ui-blocks";

export default async function MealOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const order = getMealOrder(id);

  if (!order || order.createdById !== user.id) notFound();

  const createdAt = new Date(order.createdAt);
  const dateStr = createdAt.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = createdAt.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="本餐菜单"
        subtitle={`${dateStr} ${timeStr} · 共 ${order.totalCount} 道菜`}
        action={
          <div className="flex gap-2">
            <Link href="/meal-order" className="btn secondary">
              返回点菜记录
            </Link>
            <Link href="/recipes" className="btn">
              继续点菜
            </Link>
          </div>
        }
      />

      {/* 简洁的菜单卡片 */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <Link
              key={item.id}
              href={`/recipes/${item.recipeId}?from=meal-order-${order.id}`}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                {index + 1}
              </span>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-xl">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>🍳</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.recipeTitle}</div>
                <div className="mt-0.5 text-sm text-gray-500">
                  {[item.chef, item.categoryName].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <span className="text-gray-300">→</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 text-center text-sm text-gray-600">
          共 {order.totalCount} 道菜
        </div>
      </div>
    </div>
  );
}
