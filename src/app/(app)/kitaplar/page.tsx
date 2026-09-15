import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuickAddButton } from "@/components/profile/QuickAddButton";
import { searchCatalog, catalogSize } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/data/auth";
import { cn } from "@/lib/utils";
import type { ShelfStatus } from "@/lib/types";

const STATUS_TABS: { value: ShelfStatus; label: string }[] = [
  { value: "read", label: "Okudum" },
  { value: "reading", label: "Şu an okuyorum" },
  { value: "want", label: "Okumak istiyorum" },
];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = (STATUS_TABS.some((t) => t.value === params.status) ? params.status : "read") as ShelfStatus;

  const [results, currentUser] = await Promise.all([searchCatalog(q), getCurrentUser()]);

  return (
    <div>
      <PageHeader
        eyebrow={`${catalogSize()}+ kitaplık kütüphane`}
        title="Kitap Kataloğu"
        description="Okuduğun ya da okumak istediğin kitabı bul, tek dokunuşla rafına ekle."
      />

      <form className="mb-4">
        <input type="hidden" name="status" value={status} />
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Kitap adı ya da yazar ara…"
            className="w-full rounded-full border border-[var(--line)] bg-[var(--paper-elevated)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
      </form>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.value}
            href={`/kitaplar?status=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              status === t.value ? "bg-[var(--orange-500)] text-white" : "bg-[var(--paper-sunken)] text-[var(--ink-soft)] hover:bg-[var(--line)]"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!currentUser ? (
        <EmptyState
          emoji="🔒"
          title="Önce giriş yapmalısın"
          description="Kataloğa göz atabilirsin ama rafına eklemek için giriş yapmalısın."
        />
      ) : results.length === 0 ? (
        <EmptyState emoji="🔍" title="Sonuç bulunamadı" description="Farklı bir kelimeyle aramayı dene." />
      ) : (
        <div className="space-y-2">
          {results.map((book) => (
            <div key={book.id} className="paper-card flex items-center gap-3 p-3">
              <Link href={`/kitaplar/${book.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="h-10 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: book.spineColor }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--ink)] hover:underline">{book.title}</p>
                  <p className="truncate text-xs text-[var(--ink-muted)]">
                    {book.author}
                    {book.genre ? ` · ${book.genre}` : ""}
                  </p>
                </div>
              </Link>
              <QuickAddButton title={book.title} author={book.author} status={status} genre={book.genre} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
