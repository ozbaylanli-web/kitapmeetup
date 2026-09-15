"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import { sendEventRegistrationConfirmationEmail } from "@/lib/email/send";
import { formatEventDate } from "@/lib/utils";
import type { ActionResult, RegistrationFieldType } from "@/lib/types";

const VALID_FIELD_TYPES: RegistrationFieldType[] = ["text", "textarea", "select", "checkbox"];

interface FieldInput {
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
}

/**
 * Etkinliğin kayıt formunu (organizatörün sorduğu sorular) baştan tanımlar
 * — mevcut soruları siler, gönderilen listeyi sırayla yeniden ekler. Sadece
 * etkinliği yönetebilenler çağırabilir (RLS: can_manage_event).
 */
export async function saveRegistrationFieldsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase } = ctx;

  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { ok: false, error: "Geçersiz etkinlik." };

  let fields: FieldInput[];
  try {
    fields = JSON.parse(String(formData.get("fields") ?? "[]"));
  } catch {
    return { ok: false, error: "Geçersiz form verisi." };
  }

  const { error: deleteError } = await supabase.from("event_registration_fields").delete().eq("event_id", eventId);
  if (deleteError) return { ok: false, error: deleteError.message };

  const rows = fields
    .map((f, i) => ({
      event_id: eventId,
      label: f.label.trim(),
      field_type: (VALID_FIELD_TYPES.includes(f.fieldType as RegistrationFieldType) ? f.fieldType : "text") as RegistrationFieldType,
      options: f.fieldType === "select" ? f.options.map((o) => o.trim()).filter(Boolean) : null,
      is_required: Boolean(f.required),
      order_index: i,
    }))
    .filter((f) => f.label.length > 0);

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("event_registration_fields").insert(rows);
    if (insertError) return { ok: false, error: insertError.message };
  }

  revalidatePath("/etkinlikler/[slug]", "page");
  return { ok: true };
}

/**
 * "Gidiyorum" + kayıt formu tek adımda: RSVP'yi "going" yapar, varsa kayıt
 * sorularının yanıtlarını kaydeder, ardından katılımcıya "kaydın alındı"
 * e-postası göndermeyi dener (e-posta gönderimi başarısız olsa bile kayıt
 * işlemi başarılı sayılır — bkz. src/lib/email/send.ts).
 */
export async function completeEventRegistrationAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { ok: false, error: "Geçersiz etkinlik." };

  let answers: { fieldId: string; value: string }[];
  try {
    answers = JSON.parse(String(formData.get("answers") ?? "[]"));
  } catch {
    return { ok: false, error: "Geçersiz form verisi." };
  }

  const { error: rsvpError } = await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: userId, status: "going" }, { onConflict: "event_id,user_id" });
  if (rsvpError) return { ok: false, error: rsvpError.message };

  const rows = answers.filter((a) => a.fieldId).map((a) => ({ field_id: a.fieldId, event_id: eventId, user_id: userId, value: a.value.trim() }));
  if (rows.length > 0) {
    const { error: answerError } = await supabase
      .from("event_registration_answers")
      .upsert(rows, { onConflict: "field_id,user_id" });
    if (answerError) return { ok: false, error: answerError.message };
  }

  // Onay e-postası — best-effort. Sağlayıcı kurulu değilse ya da gönderim
  // başarısız olursa kayıt işlemi yine de başarılı sayılır.
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const { data: event } = await supabase.from("events").select("title, slug, starts_at").eq("id", eventId).maybeSingle();
  if (authUser?.email && event) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kitapmeetup.com";
    await sendEventRegistrationConfirmationEmail({
      to: authUser.email,
      name: authUser.user_metadata?.full_name ?? "okur",
      eventTitle: event.title,
      eventDateLabel: formatEventDate(event.starts_at),
      eventUrl: `${siteUrl}/etkinlikler/${event.slug}`,
    });
  }

  revalidatePath("/etkinlikler/[slug]", "page");
  revalidatePath("/etkinlikler");
  return { ok: true };
}
