"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { ActionResult } from "@/lib/types";

export async function signInAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "E-posta ve şifre gerekli." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  redirect("/");
}

export async function signUpAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "")
    .toLowerCase()
    .trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  // İkisi de opsiyonel — "isteyen ekler".
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  // Bir arkadaş davet linkinden geldiyse (bkz. Ayarlar > "Arkadaşını davet et").
  const referredByUsername = String(formData.get("ref") ?? "").trim() || null;
  // "Okuyucu olarak" / "Yayınevi olarak" katılım seçimi (bkz. SignupForm).
  const accountKindRaw = String(formData.get("accountKind") ?? "reader");
  const accountKind = accountKindRaw === "publisher" ? "publisher" : "reader";
  const publisherWebsite = String(formData.get("publisherWebsite") ?? "").trim();

  if (!email || !password || !username) return { ok: false, error: "Tüm zorunlu alanları doldurun." };
  if (password.length < 6) return { ok: false, error: "Şifre en az 6 karakter olmalı." };
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { ok: false, error: "Kullanıcı adı 3-20 karakter olmalı; sadece küçük harf, rakam ve _ içerebilir." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName || username,
        birth_date: birthDate || null,
        gender: gender || null,
        referred_by_username: referredByUsername,
        account_kind: accountKind,
        publisher_website: accountKind === "publisher" ? publisherWebsite || null : null,
      },
    },
  });
  if (error) return { ok: false, error: error.message };

  redirect("/");
}

export async function signOutAction(): Promise<void> {
  if (!hasSupabaseEnv()) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  redirect("/giris");
}
