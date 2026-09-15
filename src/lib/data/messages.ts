import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { DIRECT_MESSAGES, getAuthorByUsername } from "@/lib/fixtures";
import type { AuthorSummary, ConversationSummary, MessageItem } from "@/lib/types";
import { fetchAuthorsByIds, mapAuthor } from "./mappers";
import { getCurrentUser } from "./auth";

export async function getConversations(): Promise<ConversationSummary[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  if (!hasSupabaseEnv()) {
    const results: ConversationSummary[] = [];
    for (const [key, messages] of Object.entries(DIRECT_MESSAGES)) {
      const [a, b] = key.split("|");
      if (a !== currentUser.username && b !== currentUser.username) continue;
      const otherUsername = a === currentUser.username ? b : a;
      const otherUser = getAuthorByUsername(otherUsername);
      const last = messages[messages.length - 1];
      if (!otherUser || !last) continue;
      results.push({
        otherUser,
        lastMessage: last.body,
        lastMessageAt: last.createdAt,
        fromMe: last.senderId === currentUser.id,
        unread: last.senderId !== currentUser.id,
      });
    }
    return results.sort((x, y) => new Date(y.lastMessageAt).getTime() - new Date(x.lastMessageAt).getTime());
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("direct_messages")
    .select("*")
    .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false });
  if (!rows || rows.length === 0) return [];

  const otherIds = Array.from(
    new Set(rows.map((r) => (r.sender_id === currentUser.id ? r.recipient_id : r.sender_id)))
  );
  const authorMap = await fetchAuthorsByIds(supabase, otherIds);

  const seen = new Set<string>();
  const results: ConversationSummary[] = [];
  for (const row of rows) {
    const otherId = row.sender_id === currentUser.id ? row.recipient_id : row.sender_id;
    if (seen.has(otherId)) continue;
    seen.add(otherId);
    const otherUser = authorMap.get(otherId);
    if (!otherUser) continue;
    results.push({
      otherUser,
      lastMessage: row.body,
      lastMessageAt: row.created_at,
      fromMe: row.sender_id === currentUser.id,
      unread: row.sender_id !== currentUser.id && !row.read_at,
    });
  }
  return results;
}

export async function getConversationWith(
  username: string
): Promise<{ otherUser: AuthorSummary; messages: MessageItem[] } | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const otherUser = getAuthorByUsername(username);
  if (!hasSupabaseEnv()) {
    if (!otherUser) return null;
    const key = [currentUser.username, username].sort().join("|");
    return { otherUser, messages: DIRECT_MESSAGES[key] ?? [] };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: otherRow } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (!otherRow) return null;

  const { data: rows } = await supabase
    .from("direct_messages")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherRow.id}),and(sender_id.eq.${otherRow.id},recipient_id.eq.${currentUser.id})`
    )
    .order("created_at", { ascending: true });

  return {
    otherUser: mapAuthor(otherRow),
    messages: (rows ?? []).map((r) => ({ id: r.id, senderId: r.sender_id, body: r.body, createdAt: r.created_at })),
  };
}
