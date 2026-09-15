"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { Avatar } from "@/components/ui/Avatar";
import type { AuthorSummary } from "@/lib/types";

const COLOR_OPTIONS = ["#F0611F", "#6F5A94", "#146B62", "#C05F82", "#35594D", "#B8791B", "#3E6C93", "#D24915"];
const initialState = { ok: true as const };

export function SettingsForm({ currentUser }: { currentUser: AuthorSummary }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="paper-card space-y-4 p-5">
      <div className="flex items-center gap-3">
        <Avatar name={currentUser.fullName} color={currentUser.avatarColor} url={currentUser.avatarUrl} size={48} />
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">@{currentUser.username}</p>
          <p className="text-xs text-[var(--ink-muted)]">Kullanıcı adı değiştirilemez.</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Ad Soyad</label>
        <input
          name="fullName"
          defaultValue={currentUser.fullName}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Şehir</label>
        <input
          name="city"
          defaultValue={currentUser.city ?? ""}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
            Doğum tarihi <span className="font-normal text-[var(--ink-muted)]">(opsiyonel)</span>
          </label>
          <input
            type="date"
            name="birthDate"
            defaultValue={currentUser.birthDate ?? ""}
            className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
            Cinsiyet <span className="font-normal text-[var(--ink-muted)]">(opsiyonel)</span>
          </label>
          <select
            name="gender"
            defaultValue={currentUser.gender ?? ""}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
          >
            <option value="">Belirtmek istemiyorum</option>
            <option value="Kadın">Kadın</option>
            <option value="Erkek">Erkek</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Hakkında</label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={currentUser.bio}
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-[var(--ink-soft)]">Avatar rengi</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="avatarColor" value={c} defaultChecked={c === currentUser.avatarColor} className="peer sr-only" />
              <span
                className="block h-8 w-8 rounded-full ring-2 ring-transparent peer-checked:ring-[var(--ink)]"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
