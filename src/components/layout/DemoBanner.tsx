import { Sparkles } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-4 py-3 text-sm text-[var(--orange-800)]">
      <Sparkles size={16} className="mt-0.5 shrink-0" />
      <p>
        <strong className="font-semibold">Önizleme modu:</strong> Şu an örnek verilerle geziniyorsun. Kendi
        Supabase projeni bağladığında (bkz.{" "}
        <code className="rounded bg-[var(--orange-100)] px-1 py-0.5 text-xs">README.md</code>) tüm butonlar
        gerçek verilerle çalışmaya başlar.
      </p>
    </div>
  );
}
