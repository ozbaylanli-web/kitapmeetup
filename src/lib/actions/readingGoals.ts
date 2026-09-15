"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";

export async function setReadingGoalAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const year = Number(formData.get("year"));
  const target = Number(formData.get("target"));
  if (!Number.isFinite(year) || !Number.isFinite(target) || target < 1 || target > 500) {
    return { ok: false, error: "Geçerli bir hedef gir (1-500 arası)." };
  }

  const { error } = await supabase
    .from("reading_goals")
    .upsert({ user_id: userId, year, target }, { onConflict: "user_id,year" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil/[username]", "page");
  return { ok: true };
}
