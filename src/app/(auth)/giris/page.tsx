import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { hasSupabaseEnv } from "@/lib/env";

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-1 text-center font-serif text-2xl font-semibold text-[var(--ink)]">Tekrar hoş geldin</h1>
      <p className="mb-6 text-center text-sm text-[var(--ink-muted)]">Kitap sohbetine kaldığın yerden devam et.</p>

      {!hasSupabaseEnv() && (
        <p className="mb-4 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3 py-2 text-center text-xs text-[var(--orange-800)]">
          Şu an önizleme modundasın — uygulamanın tamamını zaten “giriş yapmış” gibi gezebilirsin. Gerçek giriş için
          Supabase bağlanmalı (README.md).
        </p>
      )}

      <LoginForm />

      <p className="mt-4 text-center text-sm text-[var(--ink-muted)]">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-[var(--orange-600)] hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
