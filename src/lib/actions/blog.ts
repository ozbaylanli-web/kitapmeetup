"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function createBlogPostAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || "#F0611F";

  if (!title || !body) return { ok: false, error: "Başlık ve içerik gerekli." };

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await supabase.from("blog_posts").insert({
    author_id: userId,
    title,
    slug,
    summary,
    body,
    tags,
    color,
    is_published: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/blog");
  redirect(`/blog/${slug}`);
}
