"use server";
import { redirect } from "next/navigation";

export async function pickRandom(formData: FormData) {
  const params = new URLSearchParams();
  const cat = formData.get("categoryId");
  if (cat) params.set("categoryId", String(cat));
  const difficulty = formData.get("difficulty");
  if (difficulty) params.set("difficulty", String(difficulty));
  const maxTime = formData.get("maxTime");
  if (maxTime) params.set("maxTime", String(maxTime));
  const exclude = formData.get("excludeRecent");
  if (exclude) params.set("excludeRecent", String(exclude));
  redirect(`/random?${params.toString()}`);
}
