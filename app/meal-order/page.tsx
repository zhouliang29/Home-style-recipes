import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listMealOrders } from "@/lib/meal-order";
import { PageTitle, EmptyState } from "@/components/ui-blocks";
import { deleteMealOrderAction } from "./actions";

export default async function MealOrderListPage() {
  const user = await requireUser();
  const orders = listMealOrders(user.id);

  return (
    <div className="space-y-5">
      <PageTitle
        title="点菜记录"
        subtitle="每次生成本餐菜单的历史记录"
        action={
          <Link href="/recipes" className="btn">
            去点菜
          </Link>
        }
      />
      {orders.length === 0 ? (
        <EmptyState>
          还没有点菜记录。
          <br />
          <Link href="/recipes" className="mt-3 inline-block font-bold text-orange-600 underline">
            去全部菜谱点菜 →
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const date = new Date(order.createdAt);
            const dateStr = date.toLocaleDateString("zh-CN", {
              month: "long",
              day: "numeric",
            });
            const timeStr = date.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={order.id} className="card overflow-hidden">
                <Link
                  href={`/meal-order/${order.id}`}
                  className="flex items-center gap-4 p-4 transition hover:bg-orange-50/50"
                >
                  {/* 菜品缩略图预览 */}
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-orange-100 to-amber-50 text-xl shadow-sm"
                      >
                        {item.coverImageUrl ? (
                          <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>🍳</span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-orange-200 text-xs font-black text-orange-700 shadow-sm">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800">
                      {dateStr} · {timeStr}
                    </h3>
                    <p className="mt-0.5 text-sm muted">{order.totalCount} 道菜</p>
                    <p className="mt-1 flex flex-wrap gap-1 text-xs muted">
                      {order.items.map((i) => i.recipeTitle).join("、")}
                    </p>
                  </div>
                  <div className="text-2xl text-orange-300">→</div>
                </Link>
                <form action={deleteMealOrderAction} className="border-t border-orange-100 px-4 py-2 text-right">
                  <input type="hidden" name="id" value={order.id} />
                  <button className="text-xs font-bold text-red-500 hover:text-red-700">删除</button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
