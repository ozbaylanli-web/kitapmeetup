import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { EVENT_REGISTRATION_FIELDS, getFixtureEventRegistrants } from "@/lib/fixtures";
import type { EventRegistrant, EventSummary, RegistrationField } from "@/lib/types";
import { fetchAuthorsByIds } from "./mappers";
import { getCurrentUser } from "./auth";
import { getMyClubRole } from "./clubs";

/**
 * Bir etkinliği kim "yönetebilir" (kayıt formunu düzenleyebilir, kayıt
 * listesini görebilir): etkinliği oluşturan kişi ya da — etkinlik bir
 * kulübe bağlıysa — o kulübün sahibi/moderatörü. Gerçek güvenlik RLS'te
 * (`can_manage_event` SQL fonksiyonu) uygulanır; burası sadece arayüzde
 * doğru paneli göstermek/gizlemek için.
 */
export async function canManageEvent(event: Pick<EventSummary, "createdBy" | "club">): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;
  if (event.createdBy.id === currentUser.id) return true;
  if (!event.club) return false;
  const role = await getMyClubRole(event.club.id);
  return role === "owner" || role === "moderator";
}

export async function getRegistrationFields(eventId: string): Promise<RegistrationField[]> {
  if (!hasSupabaseEnv()) return EVENT_REGISTRATION_FIELDS[eventId] ?? [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("event_registration_fields")
    .select("*")
    .eq("event_id", eventId)
    .order("order_index", { ascending: true });

  return (data ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    fieldType: f.field_type,
    options: f.options ?? [],
    required: f.is_required,
    orderIndex: f.order_index,
  }));
}

/** Giriş yapan kullanıcının bu etkinlik için daha önce verdiği yanıtlar (varsa) — formu önceden doldurmak için. */
export async function getMyRegistrationAnswers(eventId: string): Promise<Record<string, string>> {
  if (!hasSupabaseEnv()) return {};

  const supabase = await createClient();
  const currentUser = await getCurrentUser();
  if (!supabase || !currentUser) return {};

  const { data } = await supabase
    .from("event_registration_answers")
    .select("field_id, value")
    .eq("event_id", eventId)
    .eq("user_id", currentUser.id);

  const map: Record<string, string> = {};
  (data ?? []).forEach((a) => (map[a.field_id] = a.value));
  return map;
}

/** Yönetici paneli: kim kayıt oldu (gidiyorum dedi) ve kayıt sorularına ne yanıt verdi. */
export async function getEventRegistrants(eventId: string): Promise<EventRegistrant[]> {
  if (!hasSupabaseEnv()) return getFixtureEventRegistrants(eventId);

  const supabase = await createClient();
  if (!supabase) return [];

  const [{ data: rsvpRows }, { data: fieldRows }, { data: answerRows }] = await Promise.all([
    supabase.from("event_rsvps").select("user_id, created_at").eq("event_id", eventId).eq("status", "going"),
    supabase.from("event_registration_fields").select("id, label").eq("event_id", eventId),
    supabase.from("event_registration_answers").select("field_id, user_id, value").eq("event_id", eventId),
  ]);
  if (!rsvpRows || rsvpRows.length === 0) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rsvpRows.map((r) => r.user_id));
  const fieldLabels = new Map((fieldRows ?? []).map((f) => [f.id, f.label]));
  const answersByUser = new Map<string, { fieldId: string; label: string; value: string }[]>();
  (answerRows ?? []).forEach((a) => {
    const label = fieldLabels.get(a.field_id);
    if (!label) return;
    const list = answersByUser.get(a.user_id) ?? [];
    list.push({ fieldId: a.field_id, label, value: a.value });
    answersByUser.set(a.user_id, list);
  });

  return rsvpRows
    .map((r) => {
      const user = authorMap.get(r.user_id);
      if (!user) return null;
      return { user, registeredAt: r.created_at, answers: answersByUser.get(r.user_id) ?? [] };
    })
    .filter((r): r is EventRegistrant => Boolean(r))
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
}
