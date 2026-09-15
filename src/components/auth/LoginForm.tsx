"use client";

import { useActionState } from "react";
import { signInAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";

const initialState = { ok: true as const };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="paper-card space-y-4 p-6">
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
          placeholder="••••••••"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      {state.demo && <DemoNote text="Demo modu — giriş için Supabase bağlanmalı" />}
      {"error" in state && state.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  );
}
