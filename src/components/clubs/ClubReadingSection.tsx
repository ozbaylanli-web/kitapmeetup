"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, MessageSquare, Plus } from "lucide-react";
import { setClubCurrentBookAction, createReadThreadAction } from "@/lib/actions/clubReads";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { BookSummary, ReadThreadSummary } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]";

export function ClubReadingSection({
  clubId,
  clubSlug,
  pinnedBook,
  pinnedBookNote,
  readThreads,
  canManage,
  canPost,
}: {
  clubId: string;
  clubSlug: string;
  pinnedBook: BookSummary | null | undefined;
  pinnedBookNote: string | null | undefined;
  readThreads: ReadThreadSummary[];
  canManage: boolean;
  canPost: boolean;
}) {
  const router = useRouter();
  const [editingBook, setEditingBook] = useState(false);
  const [addingThread, setAddingThread] = useState(false);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitBook(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await setClubCurrentBookAction({ ok: true }, formData);
      if (result.ok) {
        setEditingBook(false);
        router.refresh();
      } else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  function submitThread(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createReadThreadAction({ ok: true }, formData);
      if (result.ok) {
        setAddingThread(false);
        router.refresh();
      } else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  return (
    <div className="paper-card p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <BookOpen size={15} /> Şu An Okunan Kitap
      </h3>

      {!editingBook && pinnedBook && (
        <div className="mb-3 flex items-start gap-3">
          <span className="h-12 w-3 shrink-0 rounded-sm" style={{ backgroundColor: pinnedBook.spineColor }} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-sm font-semibold text-[var(--ink)]">{pinnedBook.title}</p>
            <p className="truncate text-xs text-[var(--ink-muted)]">{pinnedBook.author}</p>
            {pinnedBookNote && <p className="mt-1 text-xs italic text-[var(--ink-soft)]">“{pinnedBookNote}”</p>}
          </div>
        </div>
      )}
      {!editingBook && !pinnedBook && <p className="mb-3 text-xs text-[var(--ink-muted)]">Henüz sabitlenmiş bir kitap yok.</p>}

      {canManage && !editingBook && (
        <button type="button" onClick={() => setEditingBook(true)} className="mb-3 text-xs font-semibold text-[var(--orange-600)] hover:underline">
          {pinnedBook ? "Değiştir" : "Kitap seç"}
        </button>
      )}
      {editingBook && (
        <form onSubmit={submitBook} className="mb-3 space-y-2 rounded-xl border border-dashed border-[var(--line-strong)] p-3">
          <input type="hidden" name="clubId" value={clubId} />
          <input name="title" required defaultValue={pinnedBook?.title} placeholder="Kitap adı" className={inputClass} />
          <input name="author" defaultValue={pinnedBook?.author} placeholder="Yazar (opsiyonel)" className={inputClass} />
          <input name="note" defaultValue={pinnedBookNote ?? ""} placeholder="Not (opsiyonel, ör. “Ekim boyunca”)" className={inputClass} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingBook(false)}>
              Vazgeç
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </form>
      )}

      <div className="border-t border-[var(--line)] pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Bölüm Tartışmaları</p>
        {readThreads.length === 0 && <p className="mb-2 text-xs text-[var(--ink-muted)]">Henüz tartışma yok — ilkini sen aç.</p>}
        <div className="space-y-1">
          {readThreads.map((t) => (
            <Link
              key={t.id}
              href={`/kulupler/${clubSlug}/tartisma/${t.id}`}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--paper-sunken)]"
            >
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--ink)]">{t.title}</span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                <MessageSquare size={11} /> {t.commentCount}
              </span>
            </Link>
          ))}
        </div>

        {canPost && !addingThread && (
          <button type="button" onClick={() => setAddingThread(true)} className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--orange-600)] hover:underline">
            <Plus size={12} /> Yeni tartışma başlat
          </button>
        )}
        {addingThread && (
          <form onSubmit={submitThread} className="mt-2 flex items-center gap-2">
            <input type="hidden" name="clubId" value={clubId} />
            <input name="title" required placeholder="ör. 7-9. Bölümler" className={`${inputClass} flex-1`} />
            <Button type="submit" size="sm" disabled={pending}>
              Ekle
            </Button>
          </form>
        )}
      </div>

      {demo && <DemoNote />}
      {error && <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
