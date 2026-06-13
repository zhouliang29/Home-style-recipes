"use client";
import { useState } from "react";
import { logCookedAction } from "@/app/recipes/actions";

export function CookedButton({ recipeId }: { recipeId: string }) {
  const [show, setShow] = useState(false);
  return <>{show ? <form action={logCookedAction} className="flex gap-2 items-center"><input type="hidden" name="recipeId" value={recipeId} /><input className="field w-40" name="note" placeholder="备注（可选）" /><button className="btn" type="submit">确认</button><button className="btn secondary" type="button" onClick={()=>setShow(false)}>取消</button></form> : <button className="btn secondary" type="button" onClick={()=>setShow(true)}>📅 做过一次</button>}</>;
}
