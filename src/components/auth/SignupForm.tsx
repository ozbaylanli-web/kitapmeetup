"use client";

import { useActionState, useState } from "react";
import { Building2, User } from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { cn } from "@/lib/utils";

const initialState = { ok: true as const };

export function SignupForm({ refUsername }: { refUsername?: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [accountKind, setAccountKind] = useState<"reader" | "publisher">("reader");

  return (
    <form action={formAction} className="paper-card space-y-4 p-6">
      {refUsername && <input type="hidden" name="ref" value={refUsername} />}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-soft)]">Nasıl katılmak istersin?</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAccountKind("reader")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
              accountKind === "reader"
                ? "border-[var(--orange-400)] bg-[var(--orange-50)] text-[var(--orange-700)]"
                : "border-[var(--line)] text-[var(--ink-muted)]"
            )}
          >
            <User size={14} /> Okuyucu
          </button>
          <button
            type="button"
            onClick={() => setAccountKind("publisher")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
              accountKind === "publisher"
                ? "border-[var(--orange-400)] bg-[var(--orange-50)] text-[var(--orange-700)]"
                : "border-[var(--line)] text-[var(--ink-muted)]"
            )}
          >
            <Building2 size={14} /> Yayınevi
          </button>
        </div>
        <input type="hidden" name="accountKind" value={accountKind} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">{accountKind === "publisher" ? "Yayınevi adı" : "Ad Soyad"}</label>
        <input
          name="fullName"
          placeholder={accountKind === "publisher" ? "ör. Yordam Kitap" : "Adın Soyadın"}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      {accountKind === "publisher" && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
            Web sitesi <span className="font-normal text-[var(--ink-muted)]">(opsiyonel)</span>
          </label>
          <input
            name="publisherWebsite"
            placeholder="https://…"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Kullanıcı adı</label>
        <input
          name="username"
          required
          placeholder="kucuk_harf_rakam_alt_cizgi"
          pattern="[a-z0-9_]{3,20}"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">E-posta</label>
        <input
          type="email"
          name="email"
          required
          placeholder="sen@ornek.com"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Şifre</label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="En az 6 karakter"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      {accountKind === "reader" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
              Doğum tarihi <span className="font-normal text-[var(--ink-muted)]">(opsiyonel)</span>
            </label>
            <input
              type="date"
              name="birthDate"
              className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
            />
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
              Cinsiyet <span className="font-normal text-[var(--ink-muted)]">(opsiyonel)</span>
            </label>
            <select
              name="gender"
              defaultValue=""
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
            >
              <option value="">Belirtmek istemiyorum</option>
              <option value="Kadın">Kadın</option>
              <option value="Erkek">Erkek</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
        </div>
      )}

      {state.demo && <DemoNote text="Demo modu — kayıt için Supabase bağlanmalı" />}
      {"error" in state && state.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Hesap oluşturuluyor…" : "Kitapmeetup’a katıl"}
      </Button>
    </form>
  );
}
