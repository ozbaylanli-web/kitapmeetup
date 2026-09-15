import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { CLUBS, COMMENTS, DEMO_USER } from "@/lib/fixtures";
import type { AuthorSummary, CommentItem } from "@/lib/types";
import { fetchAuthorsByIds, mapComment } from "./mappers";

export interface ReadThreadDetail {
  id: string;
  title: string;
  createdAt: string;
  createdBy: AuthorSummary;
  club: { slug: string; name: string; icon: string };
}

/** Bölüm tartışması detayı — hangi kulübe ait olduğu dahil (geri linki ve erişim doğrulaması için). */
export async function getReadThread(threadId: string): Promise<ReadThreadDetail | null> {
  if (!hasSupabaseEnv()) {
    for (const club of CLUBS) {
      const thread = club.readThreads.find((t) => t.id === threadId);
      if (thread) return { ...thread, club: { slug: club.slug, name: club.name, icon: club.icon } };
    }
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: threadRow } = await supabase.from("club_read_threads").select("*").eq("id", threadId).maybeSingle();
  if (!threadRow) return null;

  const { data: clubRow } = await supabase.from("clubs").select("slug, name, icon").eq("id", threadRow.club_id).maybeSingle();
  if (!clubRow) return null;

  let createdBy = DEMO_USER;
  if (threadRow.created_by) {
    const { data: authorRow } = await supabase.from("profiles").select("*").eq("id", threadRow.created_by).maybeSingle();
    if (authorRow) createdBy = { id: authorRow.id, username: authorRow.username, fullName: authorRow.full_name ?? authorRow.username, bio: authorRow.bio, avatarColor: authorRow.avatar_color, avatarUrl: authorRow.avatar_url, city: authorRow.city };
  }

  return {
    id: threadRow.id,
    title: threadRow.title,
    createdAt: threadRow.created_at,
    createdBy,
    club: clubRow,
  };
}

export async function getThreadComments(threadId: string): Promise<CommentItem[]> {
  if (!hasSupabaseEnv()) return COMMENTS[threadId] ?? [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("comments")
    .select("*")
    .eq("target_type", "read_thread")
    .eq("target_id", threadId)
    .order("created_at", { ascending: true });
  if (!rows) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rows.map((r) => r.author_id));
  return rows.map((r) => mapComment(r, authorMap.get(r.author_id) ?? DEMO_USER));
}
