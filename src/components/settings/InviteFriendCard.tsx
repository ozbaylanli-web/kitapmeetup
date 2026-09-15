"use client";

import { useSyncExternalStore } from "react";
import { Users } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";

const noopSubscribe = () => () => {};

/** "Arkadaşını davet et" — Ayarlar sayfasında, kişisel davet linkini paylaşmayı kolaylaştırır. */
export function InviteFriendCard({ username }: { username: string }) {
  // Sunucuda "window" yok — useSyncExternalStore, sunucu/istemci anlık
  // görüntülerini ayırarak hydration uyuşmazlığı yaşamadan gerçek origin'i verir.
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
  const link = origin ? `${origin}/kayit?ref=${username}` : "";

  return (
    <div className="paper-card p-4">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <Users size={15} className="text-[var(--orange-600)]" /> Arkadaşını davet et
      </p>
      <p className="mb-3 text-xs text-[var(--ink-muted)]">
        Eski Kitapmeetup topluluğundan birini mi özledin? Linkini paylaş, katıldığında ikiniz de “Davetçi” rozetini kazanır.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-[var(--paper-sunken)] px-2.5 py-1.5 text-xs text-[var(--ink-soft)]">
          {link || "…"}
        </code>
        <ShareButton title="Kitapmeetup'a katıl" text="Seni Kitapmeetup'a davet ediyorum 📚" url={link} label="Davet et" />
      </div>
    </div>
  );
}
