import { requireUser } from "@/lib/auth";
import { getLatestShoppingList, listShoppingLists } from "@/lib/shopping";
import { addShoppingItemAction, clearCheckedAction, deleteShoppingItemAction, toggleShoppingItemAction } from "./actions";

export default async function ShoppingPage() {
  const user = await requireUser();
  const list = getLatestShoppingList(user.id);
  const lists = listShoppingLists();
  const unchecked = list.items.filter((i) => !i.checked).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-orange-700 sm:text-3xl">购物清单</h1>
          <p className="mt-0.5 text-sm muted">家人共用 · 买完就勾选{unchecked > 0 && ` · 还剩 ${unchecked} 项`}</p>
        </div>
      </div>

      {/* 添加条目 */}
      <form action={addShoppingItemAction} className="card grid gap-2.5 p-4 sm:grid-cols-[1fr_10rem_auto] sm:items-center">
        <input className="field" name="name" placeholder="要买什么，例如 番茄" required enterKeyHint="done" />
        <input className="field" name="amount" placeholder="数量，例如 2 个" enterKeyHint="done" />
        <button className="btn">➕ 添加</button>
      </form>

      {/* 当前清单 */}
      <section className="card animate-fade-up p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-orange-800">{list.title}</h2>
            <p className="text-sm muted">共 {list.items.length} 项</p>
          </div>
          {list.items.some((i) => i.checked) && (
            <form action={clearCheckedAction}>
              <input type="hidden" name="listId" value={list.id} />
              <button className="btn secondary !py-2 text-sm">🧹 清除已买</button>
            </form>
          )}
        </div>

        {list.items.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-5xl">🛒</div>
            <p className="mt-3 muted">清单是空的，先添加要买的食材，或从「菜单」页一键生成。</p>
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            {list.items.map((item) => (
              <div className="flex items-center gap-3 py-2" key={item.id}>
                {/* 勾选（大触控区） */}
                <form action={toggleShoppingItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    className={`mobile-action flex h-11 w-11 items-center justify-center rounded-2xl text-2xl transition active:scale-90 ${
                      item.checked ? "opacity-60" : ""
                    }`}
                    aria-label={item.checked ? "标记为未买" : "标记为已买"}
                  >
                    {item.checked ? "✅" : "⬜"}
                  </button>
                </form>
                <div className={`min-w-0 flex-1 ${item.checked ? "line-through muted" : ""}`}>
                  <span className="font-bold">{item.name}</span>
                  {item.amount && <span className="muted"> · {item.amount}</span>}
                </div>
                <form action={deleteShoppingItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    className="mobile-action flex h-11 w-11 items-center justify-center rounded-2xl text-red-500 transition hover:bg-red-50 active:scale-90"
                    aria-label="删除"
                  >
                    🗑
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 历史清单 */}
      {lists.length > 1 && (
        <section>
          <h2 className="section-title mb-2 text-base">🗂 历史清单</h2>
          <div className="flex flex-wrap gap-2">
            {lists.map((l) => (
              <span className="chip" key={l.id}>{l.title}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
