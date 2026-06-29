"use client";
import { useFormStatus } from "react-dom";
import { deleteMealOrderAction } from "@/app/meal-order/actions";

export function DeleteMealOrderButton({ orderId }: { orderId: string }) {
  const { pending } = useFormStatus();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("确定删除这条点菜记录？")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteMealOrderAction} onSubmit={handleSubmit} className="border-t border-orange-100 px-4 py-2 text-right">
      <input type="hidden" name="id" value={orderId} />
      <button disabled={pending} className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50">
        {pending ? "删除中…" : "删除"}
      </button>
    </form>
  );
}
