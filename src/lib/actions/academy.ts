"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult, RsvpStatus } from "@/lib/types";

export async function enrollAction(_prev: ActionResult, courseId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase
    .from("academy_enrollments")
    .upsert({ course_id: courseId, user_id: ctx.userId }, { onConflict: "course_id,user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/akademi");
  return { ok: true };
}

export async function completeLessonAction(_prev: ActionResult, lessonId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase
    .from("academy_lesson_progress")
    .upsert({ lesson_id: lessonId, user_id: ctx.userId }, { onConflict: "lesson_id,user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/akademi");
  return { ok: true };
}

/** Bir ders buluşmasına RSVP — event_rsvps ile birebir aynı desen (gidiyorum/ilgileniyorum). */
export async function rsvpLessonAction(
  _prev: ActionResult,
  payload: { lessonId: string; status: RsvpStatus }
): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase
    .from("academy_lesson_rsvps")
    .upsert({ lesson_id: payload.lessonId, user_id: ctx.userId, status: payload.status }, { onConflict: "lesson_id,user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/akademi");
  revalidatePath("/etkinlikler");
  return { ok: true };
}
