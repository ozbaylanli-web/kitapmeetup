import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { hasSupabaseEnv } from "@/lib/env";
import { getAuthorPreview } from "@/lib/data/authors";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const referrer = ref ? await getAuthorPreview(ref) : null;

  return (
    <div>
      <h1 className="mb-1 text-center font-serif text-2xl font-semibold text-[var(--ink)]">Kitapmeetup’a katıl</h1>
      <p className="mb-6 text-center text-sm text-[var(--ink-muted)]">Kulüplere katıl, etkinliklere gel, rafını paylaş.</p>

      {referrer && (
        <p className="mb-4 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3 py-2 text-center text-xs text-[var(--orange-800)]">
          🎉 <strong>{referrer.fullName}</strong> seni Kitapmeetup’a davet etti!
        </p>
      )}

      {!hasSupabaseEnv() && (
        <p className="mb-4 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3 py-2 text-center text-xs text-[var(--orange-800)]">
          Şu an önizleme modundasın — uygulamanın tamamını zaten “giriş yapmış” gibi gezebilirsin. Gerçek kayıt için
          Supabase bağlanmalı (README.md).
        </p>
      )}

      <SignupForm refUsername={referrer ? ref : undefined} />

      <p className="mt-4 text-center text-sm text-[var(--ink-muted)]">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-[var(--orange-600)] hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
