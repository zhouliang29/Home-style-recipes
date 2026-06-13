"use client";
import { useActionState } from "react";
import { toggleFavoriteAction } from "@/app/recipes/actions";

export function FavoriteButton({ recipeId, initialFavorite }: { recipeId: string; initialFavorite?: boolean }) {
  const [, action, pending] = useActionState(async () => { await toggleFavoriteAction(recipeId); return undefined; }, undefined);
  return <form action={action}><button className={pending?"btn disabled":"btn secondary"}>{pending?"...":initialFavorite?"✩ 取消收藏":"⭐ 收藏"}</button></form>;
}
