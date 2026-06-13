import { requireUser } from "@/lib/auth";
import { getLatestShoppingList, listShoppingLists } from "@/lib/shopping";
import { PageTitle } from "@/components/ui-blocks";
import { addShoppingItemAction, clearCheckedAction, deleteShoppingItemAction, toggleShoppingItemAction } from "./actions";

export default async function ShoppingPage() {
  const user = await requireUser();
  const list = getLatestShoppingList(user.id);
  const lists = listShoppingLists();
  return <div className="space-y-5"><PageTitle title="购物清单" subtitle="家人共用，买完就勾选。" />
    <form action={addShoppingItemAction} className="card grid gap-3 p-4 sm:grid-cols-[1fr_10rem_auto]"><input className="field" name="name" placeholder="要买什么，例如 番茄" required /><input className="field" name="amount" placeholder="数量，例如 2个" /><button className="btn">添加</button></form>
    <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black text-orange-700">{list.title}</h2><p className="text-sm muted">最近清单，共 {list.items.length} 项</p></div><form action={clearCheckedAction}><input type="hidden" name="listId" value={list.id} /><button className="btn secondary">清除已买</button></form></div>
      <div className="divide-y divide-orange-100">{list.items.map((item) => <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3" key={item.id}><form action={toggleShoppingItemAction}><input type="hidden" name="id" value={item.id} /><button className="text-2xl">{item.checked ? "✅" : "⬜"}</button></form><div className={item.checked ? "line-through muted" : ""}><span className="font-bold">{item.name}</span>{item.amount && <span className="muted"> · {item.amount}</span>}</div><form action={deleteShoppingItemAction}><input type="hidden" name="id" value={item.id} /><button className="text-red-600">删除</button></form></div>)}</div>
    </section>
    {lists.length > 1 && <section><h2 className="mb-2 font-black text-orange-700">历史清单</h2><div className="flex flex-wrap gap-2">{lists.map((l) => <span className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-orange-100" key={l.id}>{l.title}</span>)}</div></section>}
  </div>;
}
