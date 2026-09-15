import { Camera, CheckCircle2, AlertTriangle } from "lucide-react";
import { getInstagramConnectionStatus } from "@/lib/data/instagram";
import { isInstagramConfigured } from "@/lib/instagram/oauth";

/**
 * Sadece yöneticilere görünür — topluluğun ORTAK Instagram hesabını bağlar.
 * Herhangi bir yönetici "Instagram'da paylaş" dediğinde içerik hep bu tek,
 * paylaşılan hesaba gider (her kulüp kendi hesabını bağlamaz).
 */
export async function InstagramConnectionSection({ statusParam, message }: { statusParam?: string; message?: string }) {
  const { connected, username } = await getInstagramConnectionStatus();
  const configured = isInstagramConfigured();

  return (
    <div className="paper-card space-y-3 p-5">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <Camera size={15} /> Instagram (topluluğun ortak hesabı)
      </h3>

      {statusParam === "connected" && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--success)]">
          <CheckCircle2 size={14} /> Bağlantı başarılı!
        </p>
      )}
      {statusParam === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--danger)]">
          <AlertTriangle size={14} /> Bağlantı başarısız{message ? `: ${message}` : "."}
        </p>
      )}
      {statusParam === "forbidden" && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--danger)]">
          <AlertTriangle size={14} /> Bu işlem için yönetici olman gerekiyor.
        </p>
      )}
      {statusParam === "not_configured" && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--danger)]">
          <AlertTriangle size={14} /> Meta uygulaması henüz kurulmamış — bkz. docs/INSTAGRAM_SETUP.md.
        </p>
      )}

      {connected ? (
        <p className="text-xs text-[var(--ink-muted)]">
          Bağlı hesap: <span className="font-semibold text-[var(--ink)]">@{username}</span>. Etkinlik ve gönderi sayfalarındaki &ldquo;Instagram&rsquo;da
          paylaş&rdquo; butonu bu hesaba gönderir.
        </p>
      ) : (
        <p className="text-xs text-[var(--ink-muted)]">
          Henüz bir Instagram hesabı bağlı değil. Bağladığında, herhangi bir yönetici oluşturulan etkinlik/gönderileri tek tıkla bu hesapta paylaşabilir.
        </p>
      )}

      {configured ? (
        <a
          href="/api/instagram/connect"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--orange-500)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--orange-600)]"
        >
          <Camera size={13} /> {connected ? "Farklı bir hesapla yeniden bağlan" : "Instagram'a bağlan"}
        </a>
      ) : (
        <p className="text-xs text-[var(--ink-muted)]">
          Bağlamak için önce <code className="rounded bg-[var(--paper-sunken)] px-1 py-0.5">META_APP_ID</code> /{" "}
          <code className="rounded bg-[var(--paper-sunken)] px-1 py-0.5">META_APP_SECRET</code> ortam değişkenlerini ayarla — adımlar için bkz.{" "}
          <span className="font-medium text-[var(--ink-soft)]">docs/INSTAGRAM_SETUP.md</span>.
        </p>
      )}
    </div>
  );
}
