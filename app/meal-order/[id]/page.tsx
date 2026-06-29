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
    <div className="space-y-5">
      <Link href="/meal-order" className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-500">
        ← 返回点菜记录
      </Link>
      <PageTitle
        title="本餐菜单"
        subtitle={`${dateStr} ${timeStr} · 共 ${order.totalCount} 道菜`}
        action={
          <Link href="/recipes" className="btn">
            继续点菜
          </Link>
        }
      />

      {/* 菜单抬头 — 类似餐馆菜单风格 */}
      <div className="card overflow-hidden text-center">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8 text-white">
          <div className="text-5xl">📋</div>
          <h2 className="mt-3 text-2xl font-black">本餐菜单</h2>
          <p className="mt-1 text-sm text-white/80">{dateStr}</p>
        </div>

        <div className="divide-y divide-orange-100 px-4 py-2">
          {order.items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-orange-700">
                {index + 1}
              </span>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 text-2xl shadow-sm">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>🍳</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <Link href={`/recipes/${item.recipeId}`} className="font-bold text-orange-800 hover:text-orange-600 hover:underline">
                  {item.recipeTitle}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-orange-100 bg-orange-50/80 px-6 py-3 text-sm text-orange-600">
          共 {order.totalCount} 道菜 · 点餐时间 {timeStr}
        </div>
      </div>
    </div>
  );
}
